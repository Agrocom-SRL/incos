import { sequelize } from '../database/sequelize.js';
import { IGestionBimestresRepository } from '../../domain/interfaces/repositories/IGestionBimestresRepository.js';
import { CalificacionContextoRepository } from './views/CalificacionContextoRepository.js';
import { claveCursadoIniciado } from '../../domain/constants/gestion.constants.js';

/**
 * Gestión institucional de bimestres: estado institucional, métricas, validación
 * y cierre. Solo LECTURA (vistas) + coordinación; las escrituras de transición
 * (matriculas_materia / bimestres_matricula) viven en los casos de uso
 * (IniciarGestionAcademicaUseCase, activarCursadoInscripcion) sobre sus repos de
 * tabla única. Las lecturas de matriculas_materia se delegan a
 * subjectEnrollmentRepository (no se consulta esa tabla directamente aquí).
 */
export class GestionBimestresRepository extends IGestionBimestresRepository {
  constructor({
    calificacionContextoRepository,
    subjectEnrollmentRepository,
    configuracionSistemaRepository
  } = {}) {
    super();
    this.contexto = calificacionContextoRepository ?? new CalificacionContextoRepository();
    this.subjectEnrollment = subjectEnrollmentRepository ?? null;
    this.configuracion = configuracionSistemaRepository ?? null;
  }

  /**
   * ¿La gestión está iniciada? Bandera `cursado_iniciado_<gestion>` en
   * configuracion_sistema; si no existe, se cae al criterio derivado (CURSANDO).
   * @param {number} gestionId
   * @returns {Promise<boolean>}
   */
  async _gestionIniciada(gestionId) {
    const flag = this.configuracion
      ? await this.configuracion.obtenerValorPorClave(claveCursadoIniciado(gestionId))
      : null;
    if (flag != null) return flag === 'true';
    return this.subjectEnrollment
      ? this.subjectEnrollment.existeCursandoEnGestion(gestionId)
      : false;
  }

  /** @param {number} gestionId @returns {Promise<Map<number, string>>} */
  async estadosInstitucionalesBimestres(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT bimestre, estado_institucional
      FROM vista_base_gestion_bimestre_estado_institucional
      WHERE gestion_id = ?
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT }
    );
    const map = new Map();
    for (const row of rows) {
      map.set(Number(row.bimestre), row.estado_institucional);
    }
    return map;
  }

  /** @param {number} gestionId */
  async obtenerMetricasGestionBimestres(gestionId) {
    const [cursosRows, metricasRows] = await Promise.all([
      sequelize.query(
        `
        SELECT COUNT(DISTINCT fila.asignacion_docente_id) AS total
        FROM vista_base_calificacion_coordinacion_fila fila
        WHERE fila.gestion_id = ?
        `,
        { replacements: [gestionId], type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        `
        SELECT
          (
            SELECT COUNT(DISTINCT v.docente_id)
            FROM vista_calificacion_coordinacion_docentes v
            WHERE v.gestion_id = ?
          ) AS docentes_activos,
          (
            SELECT COUNT(*)
            FROM vista_base_gestion_bimestre_cierre_pendiente v
            WHERE v.gestion_id = ?
          ) AS notas_faltantes
        `,
        { replacements: [gestionId, gestionId], type: sequelize.QueryTypes.SELECT }
      )
    ]);

    const cursosTotal = Number(cursosRows[0]?.total ?? 0);
    const docentesActivos = Number(metricasRows[0]?.docentes_activos ?? 0);
    const notasFaltantes = Number(metricasRows[0]?.notas_faltantes ?? 0);

    return {
      cursosTotal,
      cursosCompletos: Math.max(
        0,
        cursosTotal - Math.min(cursosTotal, Math.ceil(notasFaltantes / 4))
      ),
      planesSinDefinir: 0,
      notasFaltantes,
      docentesActivos
    };
  }

  /** @param {number} numeroBimestre @param {number} gestionId */
  async validarCierreBimestre(numeroBimestre, gestionId) {
    const n = Number(numeroBimestre);
    const estados = await this.estadosInstitucionalesBimestres(gestionId);
    const estadoActual = estados.get(n);

    const bloqueos = [];

    if (estadoActual !== 'EN_CURSO') {
      bloqueos.push(
        estadoActual === 'CERRADO'
          ? `El bimestre ${n} ya está cerrado.`
          : `El bimestre ${n} no está en curso. Iniciá la gestión o cerrá el bimestre anterior.`
      );
    }

    const cursosRows = await sequelize.query(
      `
      SELECT
        asignacion_id,
        materia,
        docente_nombre,
        paralelo,
        COUNT(*) AS faltantes
      FROM vista_base_gestion_bimestre_cierre_pendiente
      WHERE gestion_id = ?
        AND bimestre = ?
      GROUP BY asignacion_id, materia, docente_nombre, paralelo
      HAVING faltantes > 0
      ORDER BY faltantes DESC, materia ASC
      LIMIT 50
      `,
      { replacements: [gestionId, n], type: sequelize.QueryTypes.SELECT }
    );

    const cursosConNotasFaltantes = cursosRows.map((r) => ({
      asignacionId: Number(r.asignacion_id),
      materia: r.materia,
      docente: r.docente_nombre,
      paralelo: r.paralelo,
      cantidadFaltantes: Number(r.faltantes)
    }));

    if (cursosConNotasFaltantes.length > 0) {
      bloqueos.push(
        `${cursosConNotasFaltantes.length} curso(s) con notas de bimestre sin cerrar impiden el cierre.`
      );
    }

    return {
      puedeCerrar: bloqueos.length === 0,
      bloqueos,
      advertencias: [],
      cursosConNotasFaltantes
    };
  }

  /**
   * Cierre institucional de un bimestre de la gestión vigente.
   * Valida primero (mismo criterio que validarCierreBimestre); si no puede cerrar
   * lanza CIERRE_BLOQUEADO sin persistir. Si puede: transición masiva
   * EN_CURSO → CERRADO de bimestres_matricula del bimestre en la gestión, calculando
   * nota_bimestre = nota_teorico + nota_practico donde falte (respeta las ya fijadas).
   * @param {number} numeroBimestre @param {number} userId
   * @returns {Promise<{success:true, data:{numero:number, cerrados:number}}>}
   */
  async cerrarBimestreGestion(numeroBimestre, userId) {
    const ctx = await this.contexto.obtenerContextoVigente();
    const gestionId = Number(ctx?.gestion_id);
    const n = Number(numeroBimestre);

    const validacion = await this.validarCierreBimestre(n, gestionId);
    if (!validacion.puedeCerrar) {
      const err = new Error('No se puede cerrar el bimestre');
      err.code = 'CIERRE_BLOQUEADO';
      err.validacion = validacion;
      throw err;
    }

    const cerrados = await sequelize.transaction(async (t) => {
      const [, meta] = await sequelize.query(
        `
        UPDATE bimestres_matricula bm
        INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
          AND mm.deleted_at IS NULL AND mm.activo = TRUE
        INNER JOIN oferta_cursos oc ON oc.id = mm.oferta_curso_id
        INNER JOIN paralelos_gestion pg ON pg.id = oc.paralelo_gestion_id
        INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
        SET
          bm.estado = 'CERRADO',
          bm.nota_bimestre = COALESCE(
            bm.nota_bimestre,
            COALESCE(bm.nota_teorico, 0) + COALESCE(bm.nota_practico, 0)
          ),
          bm.updated_by = ?,
          bm.updated_at = NOW()
        WHERE gp.gestion_id = ?
          AND bm.bimestre = ?
          AND bm.estado = 'EN_CURSO'
          AND bm.deleted_at IS NULL
          AND bm.activo = TRUE
        `,
        { replacements: [userId ?? null, gestionId, n], transaction: t }
      );
      return meta?.affectedRows ?? 0;
    });

    return { success: true, data: { numero: n, cerrados } };
  }

  /**
   * Apertura institucional de un bimestre de la gestión vigente: transición masiva
   * PENDIENTE → EN_CURSO de bimestres_matricula del bimestre en la gestión.
   * Bloquea si el bimestre del calendario aún es futuro (CURDATE < fecha_inicio,
   * vista 105 vía estado_calendario) lanzando BIMESTRE_FUTURO sin persistir.
   * @param {number} numeroBimestre @param {number} userId
   * @returns {Promise<{success:true, data:{numero:number, abiertos:number}}>}
   */
  async abrirBimestreGestion(numeroBimestre, userId) {
    const ctx = await this.contexto.obtenerContextoVigente();
    const gestionId = Number(ctx?.gestion_id);
    const n = Number(numeroBimestre);

    const periodos = await this.contexto.obtenerPeriodosBimestresGestion(gestionId);
    const periodo = (periodos ?? []).find((p) => Number(p.numero_orden) === n);
    if (periodo?.estado_calendario === 'futuro') {
      const err = new Error(
        `El bimestre ${n} aún no inicia según el calendario académico (fecha de inicio futura).`
      );
      err.code = 'BIMESTRE_FUTURO';
      throw err;
    }

    const abiertos = await sequelize.transaction(async (t) => {
      const [, meta] = await sequelize.query(
        `
        UPDATE bimestres_matricula bm
        INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
          AND mm.deleted_at IS NULL AND mm.activo = TRUE
        INNER JOIN oferta_cursos oc ON oc.id = mm.oferta_curso_id
        INNER JOIN paralelos_gestion pg ON pg.id = oc.paralelo_gestion_id
        INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
        SET
          bm.estado = 'EN_CURSO',
          bm.updated_by = ?,
          bm.updated_at = NOW()
        WHERE gp.gestion_id = ?
          AND bm.bimestre = ?
          AND bm.estado = 'PENDIENTE'
          AND bm.deleted_at IS NULL
          AND bm.activo = TRUE
        `,
        { replacements: [userId ?? null, gestionId, n], transaction: t }
      );
      return meta?.affectedRows ?? 0;
    });

    return { success: true, data: { numero: n, abiertos } };
  }

  async _metricasPorBimestre(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT
        bimestre,
        cursos_total,
        cursos_plan_completo,
        cursos_notas_faltantes
      FROM vista_base_gestion_metricas_bimestre
      WHERE gestion_id = ?
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT }
    );
    const map = new Map();
    for (const r of rows) {
      map.set(Number(r.bimestre), {
        cursosTotal: Number(r.cursos_total ?? 0),
        cursosConPlanCompleto: Number(r.cursos_plan_completo ?? 0),
        cursosConNotasFaltantes: Number(r.cursos_notas_faltantes ?? 0)
      });
    }
    return map;
  }

  async _metricasGlobales(gestionId) {
    const [row] = await sequelize.query(
      `
      SELECT
        COUNT(DISTINCT fila.asignacion_docente_id) AS total_cursos,
        COUNT(DISTINCT fila.docente_id) AS total_docentes,
        COUNT(DISTINCT fila.estudiante_id) AS total_estudiantes
      FROM vista_base_calificacion_coordinacion_fila fila
      WHERE fila.gestion_id = ?
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT }
    );
    return {
      totalCursos: Number(row?.total_cursos ?? 0),
      totalDocentes: Number(row?.total_docentes ?? 0),
      totalEstudiantes: Number(row?.total_estudiantes ?? 0)
    };
  }

  _mapEstadoUi(numero, inst, calEstado, bimestreVigente, gestionIniciada) {
    if (inst === 'CERRADO' || calEstado === 'cerrado') return 'cerrado';
    if (numero === bimestreVigente && inst === 'EN_CURSO') return 'vigente';
    if (!gestionIniciada && numero === 1) return 'futuro';
    if (numero > 1) {
      const prevCerrado = inst === 'PENDIENTE';
      if (prevCerrado && calEstado === 'futuro') return 'futuro';
    }
    if (calEstado === 'futuro') return 'futuro';
    return 'futuro';
  }

  /** Payload para GET /calificaciones/gestion-bimestres */
  async obtenerGestionBimestres() {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      return null;
    }

    const gestionId = Number(ctx.gestion_id);
    const [periodos, gestionIniciada, estadosMap, metricasGlobales, metricasBim] =
      await Promise.all([
        this.contexto.obtenerPeriodosBimestresGestion(gestionId),
        this._gestionIniciada(gestionId),
        this.estadosInstitucionalesBimestres(gestionId),
        this._metricasGlobales(gestionId),
        this._metricasPorBimestre(gestionId)
      ]);

    const bimestreVigente = ctx.bimestre_vigente != null ? Number(ctx.bimestre_vigente) : null;

    const bimestres = (periodos ?? []).map((pa) => {
      const numero = Number(pa.numero_orden);
      const inst = estadosMap.get(numero);
      const calEstado = pa.estado_calendario;
      const estado = this._mapEstadoUi(numero, inst, calEstado, bimestreVigente, gestionIniciada);
      const metricas = metricasBim.get(numero) ?? {
        cursosTotal: 0,
        cursosConPlanCompleto: 0,
        cursosConNotasFaltantes: 0
      };

      return {
        numero,
        codigo: `B${numero}`,
        nombre: pa.nombre,
        fechaInicio: pa.fecha_inicio,
        fechaFin: pa.fecha_fin,
        estado,
        metricas,
        matriculasTransicionadas: numero === 1 && !gestionIniciada ? null : undefined
      };
    });

    if (gestionIniciada && bimestres[0]) {
      bimestres[0].matriculasTransicionadas =
        await this.subjectEnrollment.contarCursandoEnGestion(gestionId);
    }

    return {
      gestion: {
        id: gestionId,
        codigo: ctx.gestion_codigo ?? String(gestionId),
        nombre: ctx.gestion_nombre,
        anio: ctx.gestion_anio,
        vigente: Boolean(ctx.gestion_vigente)
      },
      gestionIniciada,
      bimestreVigente,
      metricasGlobales,
      bimestres
    };
  }
}
