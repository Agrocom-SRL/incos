import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Planilla de control de Becas por carrera (solo lectura).
 *
 * Lee filas crudas (1 por estudiante matriculado por carrera/gestión) desde la
 * vista 89 reutilizada y construye:
 * - `filas`: ÁRBOL jerárquico de 3 niveles
 *   carrera → periodo (nivel/año del plan) → paralelo (hoja). Cada nodo lleva
 *   matriculados, becas por porcentaje, total con beca y % de cobertura. Las
 *   raíces son las carreras; los niveles superiores agregan sumando hijos.
 *   La vista deduplica cada estudiante a una inscripción-paralelo
 *   representativa, así que cada becado cae en un único (carrera, periodo,
 *   paralelo) y no hay doble conteo entre nodos hermanos.
 * - `totales`: globales (igual que antes),
 * - `distribucion`: por porcentaje (para donut, global),
 * - `resumen`: resumen general,
 * - `catalogo` / `catalogoResumen`: cobertura del catálogo de becas.
 *
 * Clasificación 25/50/75/100 se hace por `beca_porcentaje` (NO por código/nombre).
 * Los porcentajes presentes se derivan dinámicamente (no se hardcodean).
 *
 * Además, cada nodo `paralelo` (hoja del árbol) expone `estudiantes[]` con el
 * detalle individual (código, nombres/apellidos, CI, beca y montos) SOLO de
 * los estudiantes BECADOS de ese paralelo (el listado de detalle es de
 * becados, no de todos los matriculados). Este detalle NO afecta los
 * agregados/conteos existentes (que se siguen calculando igual con los Sets
 * `estudiantes`/`conBeca`, sobre TODOS los matriculados).
 *
 * El negocio vive aquí (no en controller ni repo).
 */
export class GetBecasPorCarreraReporteUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/IBecasPorCarreraViewRepository.js').IBecasPorCarreraViewRepository} params.becasPorCarreraViewRepository
   * @param {import('../../../domain/interfaces/repositories/IGestionRepository.js').IGestionRepository} params.managementRepository
   * @param {import('../../../domain/interfaces/repositories/IBecaDescuentoRepository.js').IBecaDescuentoRepository} params.scholarshipRepository
   * @param {Object} params.logger
   */
  constructor({
    becasPorCarreraViewRepository,
    managementRepository,
    scholarshipRepository,
    logger,
  }) {
    this.becasPorCarreraViewRepository = becasPorCarreraViewRepository;
    this.managementRepository = managementRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number|null|undefined} [params.gestionId]
   * @returns {Promise<Object>} estructura `planillaBecas`
   */
  async execute({ gestionId: rawGestionId } = {}) {
    const management = await this._resolveManagement(rawGestionId);
    const gestionId = management.id;

    const rows = await this.becasPorCarreraViewRepository.findRowsByGestionId(gestionId);

    // Porcentajes distintos presentes (solo becas reales: beca_porcentaje > 0).
    const porcentajes = this._derivePorcentajes(rows);

    // Árbol jerárquico carrera → periodo → paralelo. Cada nodo deduplica sus
    // estudiantes con un Set (mismo criterio que el grano por carrera de antes);
    // como la vista deja a cada estudiante en una sola inscripción-paralelo, los
    // Sets de paralelos hermanos son disjuntos y los niveles superiores agregan
    // sumando hijos (sin re-deduplicar).
    const carrerasMap = new Map();

    for (const row of rows) {
      const carreraId = Number(row.carrera_id);
      const periodoId = row.periodo_id == null ? null : Number(row.periodo_id);
      const paraleloId = row.paralelo_id == null ? null : Number(row.paralelo_id);
      const estudianteId = Number(row.estudiante_id);

      // --- Nodo carrera ---
      if (!carrerasMap.has(carreraId)) {
        carrerasMap.set(carreraId, {
          carreraId,
          carreraNombre: row.carrera_nombre ?? '',
          carreraCodigo: row.carrera_codigo ?? null,
          ...this._newCounters(porcentajes),
          periodos: new Map(),
        });
      }
      const carrera = carrerasMap.get(carreraId);

      // --- Nodo periodo (nivel/año del plan) ---
      const periodoKey = periodoId == null ? 'null' : periodoId;
      if (!carrera.periodos.has(periodoKey)) {
        carrera.periodos.set(periodoKey, {
          periodoId,
          periodoNumero: row.periodo_numero == null ? null : Number(row.periodo_numero),
          periodoNombre: row.periodo_nombre ?? null,
          ...this._newCounters(porcentajes),
          paralelos: new Map(),
        });
      }
      const periodo = carrera.periodos.get(periodoKey);

      // --- Nodo paralelo (hoja) ---
      const paraleloKey = paraleloId == null ? 'null' : paraleloId;
      if (!periodo.paralelos.has(paraleloKey)) {
        periodo.paralelos.set(paraleloKey, {
          paraleloId,
          paraleloNombre: row.paralelo_nombre ?? null,
          paraleloTurno: row.paralelo_turno ?? null,
          ...this._newCounters(porcentajes),
          estudiantesDetalle: new Map(),
        });
      }
      const paralelo = periodo.paralelos.get(paraleloKey);

      // Acumular estudiante (deduplicado por nodo) en los tres niveles.
      this._addEstudiante(carrera, estudianteId, row);
      this._addEstudiante(periodo, estudianteId, row);
      this._addEstudiante(paralelo, estudianteId, row);
    }

    // Construir el árbol de salida y los totales globales en una pasada.
    const filas = [];
    const totalesBecasPorPorcentaje = this._zeroCounters(porcentajes);
    let totalMatriculados = 0;
    let totalConBeca = 0;

    const carrerasOrdenadas = Array.from(carrerasMap.values()).sort((a, b) =>
      String(a.carreraNombre).localeCompare(String(b.carreraNombre), 'es', { sensitivity: 'base' })
    );

    for (const carrera of carrerasOrdenadas) {
      const carreraNode = this._carreraNode(carrera);

      const periodosOrdenados = Array.from(carrera.periodos.values()).sort(
        (a, b) => (a.periodoNumero ?? 0) - (b.periodoNumero ?? 0)
      );

      for (const periodo of periodosOrdenados) {
        const periodoNode = this._periodoNode(carrera, periodo);

        const paralelosOrdenados = Array.from(periodo.paralelos.values()).sort((a, b) =>
          String(a.paraleloNombre ?? '').localeCompare(
            String(b.paraleloNombre ?? ''),
            'es',
            { sensitivity: 'base' }
          )
        );

        for (const paralelo of paralelosOrdenados) {
          periodoNode.children.push(this._paraleloNode(carrera, periodo, paralelo));
        }

        carreraNode.children.push(periodoNode);
      }

      filas.push(carreraNode);

      // Totales globales = suma de carreras.
      totalMatriculados += carrera.estudiantes.size;
      totalConBeca += carrera.conBeca.size;
      for (const p of porcentajes) {
        totalesBecasPorPorcentaje[p] += carrera.becasPorPorcentaje[p];
      }
    }

    const porcentajeConBecaGlobal = this._round(this._pct(totalConBeca, totalMatriculados));

    const totales = {
      totalMatriculados,
      becasPorPorcentaje: this._stringifyKeys(totalesBecasPorPorcentaje),
      totalConBeca,
      porcentajeConBeca: porcentajeConBecaGlobal,
    };

    // Distribución por porcentaje (donut): beneficiados + % del total con beca.
    const distribucion = porcentajes.map((p) => ({
      porcentaje: p,
      etiqueta: `Beca ${p}%`,
      beneficiados: totalesBecasPorPorcentaje[p],
      porcentajeDelTotalConBeca: this._round(this._pct(totalesBecasPorPorcentaje[p], totalConBeca)),
    }));

    const sinBeca = totalMatriculados - totalConBeca;
    const resumen = {
      totalMatriculados,
      totalConBeca,
      porcentajeConBeca: porcentajeConBecaGlobal,
      porcentajeSinBeca: this._round(this._pct(sinBeca, totalMatriculados)),
    };

    // Catálogo de descuentos: TODOS los tramos del catálogo (becas_descuentos),
    // incluso los que NO se usan en la gestión, como dato estadístico de cobertura.
    const { tramos: catalogo, resumen: catalogoResumen } = await this._buildCatalogo(
      totalesBecasPorPorcentaje,
      totalConBeca,
    );

    this.logger?.info?.('[Pagos] Planilla becas por carrera generada', {
      gestionId,
      carreras: filas.length,
      totalMatriculados,
      totalConBeca,
      porcentajes,
      catalogoTramos: catalogo.length,
    });

    return {
      gestion: {
        id: management.id,
        nombre: management.nombre,
        anio: management.anio,
      },
      porcentajes,
      filas,
      totales,
      distribucion,
      resumen,
      catalogo,
      catalogoResumen,
    };
  }

  /**
   * Construye la cobertura del CATÁLOGO de becas/descuentos: agrupa todos los
   * tipos de beca activos por porcentaje (incluyendo tramos sin uso en la
   * gestión) y los cruza con los beneficiados reales. Dato estadístico: cuántos
   * tramos existen, cuántos se usan y cuántos beneficiados tiene cada uno.
   *
   * @param {Object<string, number>} beneficiadosPorPorcentaje - beneficiados reales por tramo.
   * @param {number} totalConBeca
   * @returns {Promise<{ tramos: Array<Object>, resumen: Object }>}
   */
  async _buildCatalogo(beneficiadosPorPorcentaje, totalConBeca) {
    const becas = await this._loadCatalogo();

    // Agrupar por porcentaje (solo becas reales: porcentaje > 0).
    const grupos = new Map();
    for (const beca of becas) {
      const p = Number(beca.percentage);
      if (Number.isFinite(p) && p > 0) {
        if (!grupos.has(p)) {
          grupos.set(p, { porcentaje: p, tipos: 0 });
        }
        grupos.get(p).tipos += 1;
      }
    }

    const tramos = Array.from(grupos.values())
      .sort((a, b) => a.porcentaje - b.porcentaje)
      .map((grupo) => {
        const beneficiados = Number(beneficiadosPorPorcentaje[grupo.porcentaje]) || 0;
        return {
          porcentaje: grupo.porcentaje,
          etiqueta: `Beca ${grupo.porcentaje}%`,
          tipos: grupo.tipos,
          beneficiados,
          usado: beneficiados > 0,
          porcentajeDelTotalConBeca: this._round(this._pct(beneficiados, totalConBeca)),
        };
      });

    const resumen = {
      totalTipos: tramos.reduce((acc, t) => acc + t.tipos, 0),
      tramosTotales: tramos.length,
      tramosUsados: tramos.filter((t) => t.usado).length,
    };

    return { tramos, resumen };
  }

  /**
   * Carga el catálogo de becas/descuentos activas y lo normaliza a objetos planos.
   * @returns {Promise<Array<Object>>}
   */
  async _loadCatalogo() {
    if (!this.scholarshipRepository?.findAll) return [];
    try {
      const result = await this.scholarshipRepository.findAll({});
      const list = Array.isArray(result) ? result : result?.scholarships ?? [];
      return list.map((beca) => (beca?.toPlainObject ? beca.toPlainObject() : beca));
    } catch (error) {
      this.logger?.warn?.('[Pagos] No se pudo cargar el catálogo de becas', {
        error: error.message,
      });
      return [];
    }
  }

  // ============================================
  // Construcción del árbol carrera → periodo → paralelo
  // ============================================

  /**
   * Acumuladores compartidos por cualquier nodo del árbol.
   * @param {number[]} porcentajes
   * @returns {{ estudiantes: Set<number>, conBeca: Set<number>, becasPorPorcentaje: Object }}
   */
  _newCounters(porcentajes) {
    return {
      estudiantes: new Set(),
      conBeca: new Set(),
      becasPorPorcentaje: this._zeroCounters(porcentajes),
    };
  }

  /**
   * Acumula un estudiante (deduplicado por nodo vía Set) en los contadores de
   * un nodo; si tiene beca real, lo cuenta una sola vez en su tramo Y, si el
   * nodo lleva `estudiantesDetalle` (solo nodos paralelo), guarda también su
   * detalle individual. El detalle SOLO se guarda para becados: la planilla
   * de detalle es un listado de becados, no de todos los matriculados (el
   * conteo de matriculados en `estudiantes` no se ve afectado).
   * @param {{ estudiantes: Set<number>, conBeca: Set<number>, becasPorPorcentaje: Object, estudiantesDetalle?: Map<number, Object> }} node
   * @param {number} estudianteId
   * @param {Object} row
   */
  _addEstudiante(node, estudianteId, row) {
    node.estudiantes.add(estudianteId);
    if (this._tieneBeca(row) && !node.conBeca.has(estudianteId)) {
      node.conBeca.add(estudianteId);
      const porcentaje = Number(row.beca_porcentaje);
      if (node.becasPorPorcentaje[porcentaje] != null) {
        node.becasPorPorcentaje[porcentaje] += 1;
      }
      if (node.estudiantesDetalle && !node.estudiantesDetalle.has(estudianteId)) {
        node.estudiantesDetalle.set(estudianteId, this._buildEstudianteDetalle(estudianteId, row));
      }
    }
  }

  /**
   * Construye el detalle individual de un estudiante BECADO (para el listado
   * por paralelo), a partir de una fila cruda de la vista 89. Solo se invoca
   * cuando `_tieneBeca(row)` ya es verdadero (ver `_addEstudiante`).
   * @param {number} estudianteId
   * @param {Object} row
   * @returns {Object}
   */
  _buildEstudianteDetalle(estudianteId, row) {
    return {
      estudianteId,
      codigo: row.codigo_estudiante ?? null,
      apellidoPaterno: row.apellido_paterno ?? null,
      apellidoMaterno: row.apellido_materno ?? null,
      nombres: row.nombres ?? null,
      ci: row.ci ?? null,
      becaNombre: row.beca_descuento_nombre ?? null,
      becaPorcentaje: Number(row.beca_porcentaje) || 0,
      montoDescuento: this._round(Number(row.descuento_beca) || 0),
      montoBase: this._round(Number(row.aporte_monto_base) || 0),
    };
  }

  /**
   * Métricas comunes a todo nodo (matriculados, becas por tramo, cobertura).
   * @param {{ estudiantes: Set<number>, conBeca: Set<number>, becasPorPorcentaje: Object }} node
   */
  _metrics(node) {
    const totalMatriculados = node.estudiantes.size;
    const totalConBeca = node.conBeca.size;
    const porcentajeConBeca = this._round(this._pct(totalConBeca, totalMatriculados));
    return {
      totalMatriculados,
      becasPorPorcentaje: this._stringifyKeys(node.becasPorPorcentaje),
      totalConBeca,
      porcentajeConBeca,
      porcentajeCobertura: porcentajeConBeca,
    };
  }

  /** Nodo raíz (carrera). */
  _carreraNode(carrera) {
    return {
      nivel: 'carrera',
      id: `c${carrera.carreraId}`,
      label: carrera.carreraNombre,
      carreraId: carrera.carreraId,
      carreraNombre: carrera.carreraNombre,
      carreraCodigo: carrera.carreraCodigo,
      periodoId: null,
      periodoNumero: null,
      periodoNombre: null,
      paraleloId: null,
      paraleloNombre: null,
      paraleloTurno: null,
      ...this._metrics(carrera),
      children: [],
    };
  }

  /** Nodo intermedio (periodo = nivel/año del plan). */
  _periodoNode(carrera, periodo) {
    const label =
      periodo.periodoNombre ??
      (periodo.periodoNumero != null ? `Periodo ${periodo.periodoNumero}` : 'Periodo');
    return {
      nivel: 'periodo',
      id: `c${carrera.carreraId}-p${periodo.periodoId}`,
      label,
      carreraId: carrera.carreraId,
      carreraNombre: carrera.carreraNombre,
      carreraCodigo: carrera.carreraCodigo,
      periodoId: periodo.periodoId,
      periodoNumero: periodo.periodoNumero,
      periodoNombre: periodo.periodoNombre,
      paraleloId: null,
      paraleloNombre: null,
      paraleloTurno: null,
      ...this._metrics(periodo),
      children: [],
    };
  }

  /**
   * Nodo hoja (paralelo). Sin `children`. Expone `estudiantes[]` con el
   * detalle individual (código, apellidos, nombres, CI, beca y montos) SOLO
   * de los BECADOS de ese paralelo, ordenado por
   * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (convención del proyecto).
   * No afecta los agregados/conteos existentes (matriculados totales).
   */
  _paraleloNode(carrera, periodo, paralelo) {
    const nombre = paralelo.paraleloNombre ?? '';
    const turno = paralelo.paraleloTurno;
    const label = turno ? `Paralelo ${nombre} (${turno})` : `Paralelo ${nombre}`;
    return {
      nivel: 'paralelo',
      id: `c${carrera.carreraId}-p${periodo.periodoId}-par${paralelo.paraleloId}`,
      label,
      carreraId: carrera.carreraId,
      carreraNombre: carrera.carreraNombre,
      carreraCodigo: carrera.carreraCodigo,
      periodoId: periodo.periodoId,
      periodoNumero: periodo.periodoNumero,
      periodoNombre: periodo.periodoNombre,
      paraleloId: paralelo.paraleloId,
      paraleloNombre: paralelo.paraleloNombre,
      paraleloTurno: paralelo.paraleloTurno,
      ...this._metrics(paralelo),
      estudiantes: Array.from(paralelo.estudiantesDetalle.values()).sort((a, b) => {
        const cmpPaterno = String(a.apellidoPaterno ?? '').localeCompare(
          String(b.apellidoPaterno ?? ''),
          'es',
          { sensitivity: 'base' }
        );
        if (cmpPaterno !== 0) return cmpPaterno;
        const cmpMaterno = String(a.apellidoMaterno ?? '').localeCompare(
          String(b.apellidoMaterno ?? ''),
          'es',
          { sensitivity: 'base' }
        );
        if (cmpMaterno !== 0) return cmpMaterno;
        return String(a.nombres ?? '').localeCompare(String(b.nombres ?? ''), 'es', {
          sensitivity: 'base',
        });
      }),
    };
  }

  // ============================================
  // Helpers de negocio
  // ============================================

  /**
   * Una fila representa beca real cuando su porcentaje es > 0 y el tipo aplica.
   * @param {Object} row
   * @returns {boolean}
   */
  _tieneBeca(row) {
    const porcentaje = Number(row.beca_porcentaje);
    if (!Number.isFinite(porcentaje) || porcentaje <= 0) {
      return false;
    }
    const tipo = row.beca_tipo_nombre;
    if (tipo != null && String(tipo).trim().toUpperCase() === 'NO APLICA') {
      return false;
    }
    return true;
  }

  /**
   * Deriva los porcentajes DISTINTOS presentes (solo becas reales), asc.
   * @param {Array<Object>} rows
   * @returns {number[]}
   */
  _derivePorcentajes(rows) {
    const set = new Set();
    for (const row of rows) {
      if (this._tieneBeca(row)) {
        set.add(Number(row.beca_porcentaje));
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }

  /** @param {number[]} porcentajes */
  _zeroCounters(porcentajes) {
    const obj = {};
    for (const p of porcentajes) {
      obj[p] = 0;
    }
    return obj;
  }

  /** Convierte claves numéricas a string para el contrato JSON. */
  _stringifyKeys(counters) {
    const out = {};
    for (const key of Object.keys(counters)) {
      out[String(key)] = counters[key];
    }
    return out;
  }

  /** @returns {number} porcentaje sin redondear */
  _pct(parte, total) {
    if (!total || total <= 0) {
      return 0;
    }
    return (parte / total) * 100;
  }

  /** Redondea a 2 decimales. */
  _round(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  /**
   * Resuelve la gestión: la pasada por id (validada) o la VIGENTE.
   * @param {string|number|null|undefined} rawGestionId
   * @returns {Promise<{ id: number, nombre: string|null, anio: number|null }>}
   */
  async _resolveManagement(rawGestionId) {
    let model;

    if (rawGestionId != null && rawGestionId !== '') {
      const id = parseInt(String(rawGestionId), 10);
      if (Number.isNaN(id) || id < 1) {
        throw new ValidationError('gestion_id inválido');
      }
      model = await this.managementRepository.findById(id);
      if (!model) {
        throw new NotFoundError(`Gestión con ID ${id}`);
      }
    } else {
      model = await this.managementRepository.findBy({ vigente: true, isActive: true });
      if (!model) {
        throw new ValidationError('No hay una gestión vigente configurada en el sistema');
      }
    }

    const plain = model.toPlainObject ? model.toPlainObject() : model;
    const id = plain?.id ?? model.id;
    if (id == null) {
      throw new ValidationError('No se pudo determinar la gestión');
    }

    return {
      id: Number(id),
      nombre: plain?.name ?? plain?.nombre ?? null,
      anio: plain?.year ?? plain?.anio ?? null,
    };
  }
}
