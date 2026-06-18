import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Planilla de control de Becas por carrera (solo lectura).
 *
 * Lee filas crudas (1 por estudiante matriculado por carrera/gestión) desde la
 * vista 89 reutilizada y construye:
 * - filas por carrera (matriculados, becas por porcentaje, % cobertura),
 * - totales globales,
 * - distribución por porcentaje (para donut),
 * - resumen.
 *
 * Clasificación 25/50/75/100 se hace por `beca_porcentaje` (NO por código/nombre).
 * Los porcentajes presentes se derivan dinámicamente (no se hardcodean).
 *
 * El negocio vive aquí (no en controller ni repo).
 */
export class GetBecasPorCarreraReporteUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../domain/interfaces/repositories/IBecasPorCarreraViewRepository.js').IBecasPorCarreraViewRepository} params.becasPorCarreraViewRepository
   * @param {import('../../../domain/interfaces/repositories/IGestionRepository.js').IGestionRepository} params.managementRepository
   * @param {Object} params.logger
   */
  constructor({ becasPorCarreraViewRepository, managementRepository, logger }) {
    this.becasPorCarreraViewRepository = becasPorCarreraViewRepository;
    this.managementRepository = managementRepository;
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

    // Agrupar por carrera, deduplicando estudiantes por carrera.
    const carrerasMap = new Map();

    for (const row of rows) {
      const carreraId = Number(row.carrera_id);
      if (!carrerasMap.has(carreraId)) {
        carrerasMap.set(carreraId, {
          carreraId,
          carreraNombre: row.carrera_nombre ?? '',
          carreraCodigo: row.carrera_codigo ?? null,
          estudiantes: new Set(),
          becasPorPorcentaje: this._zeroCounters(porcentajes),
          conBeca: new Set(),
        });
      }

      const carrera = carrerasMap.get(carreraId);
      const estudianteId = Number(row.estudiante_id);
      carrera.estudiantes.add(estudianteId);

      if (this._tieneBeca(row)) {
        const porcentaje = Number(row.beca_porcentaje);
        if (!carrera.conBeca.has(estudianteId)) {
          carrera.conBeca.add(estudianteId);
          if (carrera.becasPorPorcentaje[porcentaje] != null) {
            carrera.becasPorPorcentaje[porcentaje] += 1;
          }
        }
      }
    }

    // Construir filas por carrera.
    const filas = [];
    const totalesBecasPorPorcentaje = this._zeroCounters(porcentajes);
    let totalMatriculados = 0;
    let totalConBeca = 0;

    for (const carrera of carrerasMap.values()) {
      const matriculados = carrera.estudiantes.size;
      const conBeca = carrera.conBeca.size;
      const porcentajeConBeca = this._round(this._pct(conBeca, matriculados));

      filas.push({
        carreraId: carrera.carreraId,
        carreraNombre: carrera.carreraNombre,
        carreraCodigo: carrera.carreraCodigo,
        modalidad: 'ANUALIZADA',
        totalMatriculados: matriculados,
        becasPorPorcentaje: this._stringifyKeys(carrera.becasPorPorcentaje),
        totalConBeca: conBeca,
        porcentajeConBeca,
        porcentajeCobertura: porcentajeConBeca,
      });

      totalMatriculados += matriculados;
      totalConBeca += conBeca;
      for (const p of porcentajes) {
        totalesBecasPorPorcentaje[p] += carrera.becasPorPorcentaje[p];
      }
    }

    // Orden estable: por nombre de carrera.
    filas.sort((a, b) =>
      String(a.carreraNombre).localeCompare(String(b.carreraNombre), 'es', { sensitivity: 'base' })
    );

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

    this.logger?.info?.('[Pagos] Planilla becas por carrera generada', {
      gestionId,
      carreras: filas.length,
      totalMatriculados,
      totalConBeca,
      porcentajes,
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
