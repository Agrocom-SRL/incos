import { sequelize } from '../database/sequelize.js';
import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';

/**
 * Gestión institucional de bimestres (estado, métricas, iniciar/cerrar).
 */
export class GestionBimestresRepository {
  constructor({ calificacionContextoRepository } = {}) {
    this.contexto =
      calificacionContextoRepository ?? new CalificacionContextoRepository();
  }

  /** @param {number} gestionId */
  async gestionAcademicaIniciada(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM matriculas_materia mm
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      WHERE gp.gestion_id = ?
        AND mm.estado IN ('CURSANDO', 'APROBADO', 'REPROBADO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }

  /** @param {number} gestionId @returns {Promise<Map<number, string>>} */
  async estadosInstitucionalesBimestres(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT
        bm.bimestre,
        CASE
          WHEN COUNT(*) = SUM(CASE WHEN bm.estado = 'CERRADO' THEN 1 ELSE 0 END) THEN 'CERRADO'
          WHEN SUM(CASE WHEN bm.estado = 'EN_CURSO' THEN 1 ELSE 0 END) > 0 THEN 'EN_CURSO'
          ELSE 'PENDIENTE'
        END AS estado_institucional
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      WHERE gp.gestion_id = ?
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      GROUP BY bm.bimestre
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
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
        { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
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
            FROM bimestres_matricula bm
            INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
            INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
            INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
            WHERE gp.gestion_id = ?
              AND mm.estado = 'CURSANDO'
              AND bm.estado = 'EN_CURSO'
              AND bm.nota_bimestre IS NULL
              AND bm.nota_habilitacion IS NULL
              AND bm.deleted_at IS NULL
              AND bm.activo = TRUE
          ) AS notas_faltantes
        `,
        { replacements: [gestionId, gestionId], type: sequelize.QueryTypes.SELECT },
      ),
    ]);

    const cursosTotal = Number(cursosRows[0]?.total ?? 0);
    const docentesActivos = Number(metricasRows[0]?.docentes_activos ?? 0);
    const notasFaltantes = Number(metricasRows[0]?.notas_faltantes ?? 0);

    return {
      cursosTotal,
      cursosCompletos: Math.max(
        0,
        cursosTotal - Math.min(cursosTotal, Math.ceil(notasFaltantes / 4)),
      ),
      planesSinDefinir: 0,
      notasFaltantes,
      docentesActivos,
    };
  }

  /** @param {number} userId */
  async iniciarGestionAcademica(userId) {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      throw new Error('No hay gestión académica vigente');
    }

    const gestionId = Number(ctx.gestion_id);
    const yaIniciada = await this.gestionAcademicaIniciada(gestionId);
    if (yaIniciada) {
      const err = new Error('La gestión académica ya fue iniciada');
      err.code = 'GESTION_YA_INICIADA';
      throw err;
    }

    const [, meta] = await sequelize.query(
      `
      UPDATE matriculas_materia mm
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      SET mm.estado = 'CURSANDO',
          mm.updated_by = ?,
          mm.updated_at = NOW()
      WHERE gp.gestion_id = ?
        AND mm.estado = 'INSCRITO'
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      `,
      { replacements: [userId, gestionId] },
    );

    await sequelize.query(
      `
      UPDATE bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      SET bm.estado = 'EN_CURSO',
          bm.updated_by = ?,
          bm.updated_at = NOW()
      WHERE gp.gestion_id = ?
        AND bm.bimestre = 1
        AND mm.estado = 'CURSANDO'
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      `,
      { replacements: [userId, gestionId] },
    );

    return {
      matriculasInscritoACursando: meta?.affectedRows ?? 0,
    };
  }

  /** @param {number} numeroBimestre @param {number} gestionId */
  async validarCierreBimestre(numeroBimestre, gestionId) {
    const n = Number(numeroBimestre);
    const estados = await this.estadosInstitucionalesBimestres(gestionId);
    const estadoActual = estados.get(n);

    const bloqueos = [];
    const advertencias = [];

    if (estadoActual !== 'EN_CURSO') {
      bloqueos.push(
        estadoActual === 'CERRADO'
          ? `El bimestre ${n} ya está cerrado.`
          : `El bimestre ${n} no está en curso. Iniciá la gestión o cerrá el bimestre anterior.`,
      );
    }

    const pendientes = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      WHERE gp.gestion_id = ?
        AND bm.bimestre = ?
        AND mm.estado = 'CURSANDO'
        AND bm.estado = 'EN_CURSO'
        AND bm.nota_bimestre IS NULL
        AND bm.nota_habilitacion IS NULL
        AND bm.deleted_at IS NULL
      `,
      { replacements: [gestionId, n], type: sequelize.QueryTypes.SELECT },
    );

    const faltantes = Number(pendientes[0]?.total ?? 0);
    if (faltantes > 0) {
      advertencias.push(
        `${faltantes} matrícula(s) sin nota de bimestre cerrada (se cerrará igual si no hay bloqueos).`,
      );
    }

    return {
      puedeCerrar: bloqueos.length === 0,
      bloqueos,
      advertencias,
    };
  }

  /** @param {number} numeroBimestre @param {number} userId */
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

    await sequelize.query(
      `
      UPDATE bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      SET bm.estado = 'CERRADO',
          bm.updated_by = ?,
          bm.updated_at = NOW()
      WHERE gp.gestion_id = ?
        AND bm.bimestre = ?
        AND bm.estado = 'EN_CURSO'
        AND bm.deleted_at IS NULL
      `,
      { replacements: [userId, gestionId, n] },
    );

    const siguiente = n < 4 ? n + 1 : null;
    if (siguiente != null) {
      await sequelize.query(
        `
        UPDATE bimestres_matricula bm
        INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
        INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
        INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
        SET bm.estado = 'EN_CURSO',
            bm.updated_by = ?,
            bm.updated_at = NOW()
        WHERE gp.gestion_id = ?
          AND bm.bimestre = ?
          AND mm.estado = 'CURSANDO'
          AND bm.estado = 'PENDIENTE'
          AND bm.deleted_at IS NULL
        `,
        { replacements: [userId, gestionId, siguiente] },
      );
    }

    return { bimestreSiguiente: siguiente };
  }

  /** Payload para GET /calificaciones/gestion-bimestres */
  async obtenerGestionBimestres() {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      return null;
    }

    const gestionId = Number(ctx.gestion_id);
    const [periodos, gestionIniciada, estadosMap, metricas] = await Promise.all([
      this.contexto.obtenerPeriodosBimestresGestion(gestionId),
      this.gestionAcademicaIniciada(gestionId),
      this.estadosInstitucionalesBimestres(gestionId),
      this.obtenerMetricasGestionBimestres(gestionId),
    ]);

    const bimestreVigente = ctx.bimestre_vigente != null ? Number(ctx.bimestre_vigente) : null;

    const bimestres = (periodos ?? []).map((pa) => {
      const numero = Number(pa.numero_orden);
      let estado = 'BLOQUEADO';
      const inst = estadosMap.get(numero);
      if (inst === 'CERRADO') estado = 'CERRADO';
      else if (inst === 'EN_CURSO') estado = 'EN_CURSO';
      else if (numero === 1 && !gestionIniciada) estado = 'BLOQUEADO';
      else if (numero > 1) {
        const prev = estadosMap.get(numero - 1);
        if (prev === 'CERRADO' && inst === 'PENDIENTE') estado = 'BLOQUEADO';
      }

      return {
        numero,
        nombre: pa.nombre,
        fechaInicio: pa.fecha_inicio,
        fechaFin: pa.fecha_fin,
        estado,
        fechaCierre: estado === 'CERRADO' ? pa.fecha_fin : null,
        matriculasTransicionadas:
          numero === 1 && gestionIniciada ? undefined : numero === 1 ? null : undefined,
      };
    });

    if (gestionIniciada && bimestres[0]) {
      const [countRow] = await sequelize.query(
        `
        SELECT COUNT(*) AS total
        FROM matriculas_materia mm
        INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
        INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
        WHERE gp.gestion_id = ?
          AND mm.estado = 'CURSANDO'
        `,
        { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
      );
      bimestres[0].matriculasTransicionadas = Number(countRow?.total ?? 0);
    }

    return {
      gestion: {
        id: gestionId,
        nombre: ctx.gestion_nombre,
        anio: ctx.gestion_anio,
      },
      gestionIniciada,
      bimestreVigente,
      metricas,
      bimestres,
    };
  }
}
