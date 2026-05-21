import { sequelize } from '../database/sequelize.js';

/**
 * Lecturas de coordinación y cursos docente (vistas 104, 106, 108, 109, 107).
 */
export class CalificacionCoordinacionRepository {
  /**
   * @param {Object} options
   * @param {boolean} [options.preliminar=false]
   * @param {string} [options.q]
   * @param {number} [options.limit=50]
   */
  async listarDocentesCoordinacion(options = {}) {
    const { preliminar = false, q, limit = 50 } = options;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    if (preliminar) {
      return sequelize.query(
        `
        SELECT
          v.docente_id,
          v.docente_nombre,
          v.docente_especialidad,
          v.cantidad_cursos,
          v.cantidad_materias,
          v.cantidad_estudiantes,
          v.carreras_detalle
        FROM vista_calificacion_coordinacion_docentes v
        ORDER BY v.cantidad_estudiantes DESC, v.cantidad_cursos DESC, v.docente_nombre ASC
        LIMIT ?
        `,
        { replacements: [lim], type: sequelize.QueryTypes.SELECT },
      );
    }

    const raw = String(q ?? '').trim();
    if (raw.length < 2) {
      return [];
    }
    const safe = raw.replace(/%/g, '').replace(/_/g, '');
    const term = `%${safe}%`;

    return sequelize.query(
      `
      SELECT
        v.docente_id,
        v.docente_nombre,
        v.docente_especialidad,
        v.cantidad_cursos,
        v.cantidad_materias,
        v.cantidad_estudiantes,
        v.carreras_detalle
      FROM vista_calificacion_coordinacion_docentes v
      WHERE (
        COALESCE(v.docente_nombre, '') LIKE ?
        OR COALESCE(v.docente_especialidad, '') LIKE ?
        OR COALESCE(v.carreras_detalle, '') LIKE ?
      )
      ORDER BY v.cantidad_estudiantes DESC, v.cantidad_cursos DESC, v.docente_nombre ASC
      LIMIT ?
      `,
      { replacements: [term, term, term, lim], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** @param {number} docenteId */
  async obtenerDocenteCalificaciones(docenteId) {
    const rows = await sequelize.query(
      `
      SELECT docente_id, docente_nombre
      FROM vista_calificacion_docente_encabezado
      WHERE docente_id = ?
      LIMIT 1
      `,
      { replacements: [docenteId], type: sequelize.QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }

  /** @param {number} docenteId */
  async listarCursosPorDocente(docenteId) {
    return sequelize.query(
      `
      SELECT
        asignacion_docente_id,
        materia_nombre,
        materia_sigla,
        carrera_nombre,
        carrera_color_hex,
        paralelo_nombre,
        paralelo_turno,
        asignatura_periodo_nombre,
        horas_semanales,
        teorico_override,
        practico_override,
        cantidad_estudiantes,
        cantidad_evaluaciones_bimestre
      FROM vista_calificacion_cursos_docente
      WHERE docente_id = ?
      ORDER BY carrera_nombre ASC, materia_nombre ASC, paralelo_nombre ASC
      `,
      { replacements: [docenteId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * @param {number} docenteId
   * @param {number} notaMinimaAprobacion
   */
  async listarResumenBimestresCursosPorDocente(docenteId, notaMinimaAprobacion = 61) {
    const min = Number(notaMinimaAprobacion) || 61;

    return sequelize.query(
      `
      SELECT
        f.asignacion_docente_id,
        f.bimestre,
        COUNT(DISTINCT f.matricula_materia_id) AS matriculas,
        SUM(
          CASE
            WHEN f.nota_efectiva IS NOT NULL AND f.nota_efectiva >= ?
            THEN 1
            ELSE 0
          END
        ) AS aprobados,
        SUM(
          CASE
            WHEN f.nota_efectiva IS NOT NULL AND f.nota_efectiva < ?
            THEN 1
            ELSE 0
          END
        ) AS reprobados,
        SUM(
          CASE
            WHEN f.nota_efectiva IS NULL
            THEN 1
            ELSE 0
          END
        ) AS pendientes,
        SUM(CASE WHEN f.estado_bimestre = 'CERRADO' THEN 1 ELSE 0 END) AS cerrados,
        COALESCE(MAX(ev.cantidad_evaluaciones), 0) AS evaluaciones
      FROM vista_base_calificacion_resumen_bimestre_fila f
      LEFT JOIN vista_base_calificacion_evaluaciones_curso_bimestre ev
        ON ev.asignacion_docente_id = f.asignacion_docente_id
        AND ev.gestion_id = f.gestion_id
        AND ev.bimestre = f.bimestre
      WHERE f.docente_id = ?
      GROUP BY f.asignacion_docente_id, f.bimestre
      `,
      {
        replacements: [min, min, docenteId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /** @param {number} asignacionId */
  async obtenerCursoPorAsignacion(asignacionId) {
    const rows = await sequelize.query(
      `
      SELECT
        docente_id,
        asignacion_docente_id,
        materia_nombre,
        materia_sigla,
        carrera_nombre,
        carrera_color_hex,
        paralelo_nombre,
        paralelo_turno,
        asignatura_periodo_nombre,
        cantidad_estudiantes
      FROM vista_calificacion_cursos_docente
      WHERE asignacion_docente_id = ?
      LIMIT 1
      `,
      { replacements: [asignacionId], type: sequelize.QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }

  /** @param {number} asignacionId */
  async listarEstudiantesRegistroNotas(asignacionId) {
    return sequelize.query(
      `
      SELECT
        est.id AS estudiante_id,
        est.codigo_estudiante AS codigo_estudiante,
        est.ci AS cedula,
        TRIM(
          CONCAT_WS(
            ' ',
            est.apellido_paterno,
            est.apellido_materno,
            est.nombres
          )
        ) AS nombre_completo,
        mm.id AS matricula_materia_id,
        mm.nota_final,
        bm.bimestre,
        bm.nota_teorico,
        bm.nota_practico,
        bm.nota_bimestre,
        bm.nota_habilitacion,
        bm.estado AS estado_bimestre
      FROM matriculas_materia mm
      INNER JOIN inscripciones ins
        ON ins.id = mm.inscripcion_id
        AND ins.deleted_at IS NULL
        AND ins.activo = TRUE
      INNER JOIN estudiantes_datos_academicos eda
        ON eda.id = ins.datos_academicos_id
        AND eda.deleted_at IS NULL
        AND eda.activo = TRUE
      INNER JOIN estudiantes est
        ON est.id = eda.estudiante_id
        AND est.deleted_at IS NULL
        AND est.activo = TRUE
      INNER JOIN asignaciones_docentes ad
        ON ad.id = mm.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
      INNER JOIN gestiones_planes gp
        ON gp.id = ad.gestion_plan_id
        AND gp.deleted_at IS NULL
      INNER JOIN gestiones g
        ON g.id = gp.gestion_id
        AND g.vigente = TRUE
        AND g.activo = TRUE
        AND g.deleted_at IS NULL
      LEFT JOIN bimestres_matricula bm
        ON bm.matricula_materia_id = mm.id
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      WHERE mm.asignacion_docente_id = ?
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      ORDER BY
        est.apellido_paterno ASC,
        est.apellido_materno ASC,
        est.nombres ASC,
        bm.bimestre ASC
      `,
      { replacements: [asignacionId], type: sequelize.QueryTypes.SELECT },
    );
  }
}
