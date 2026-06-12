import { sequelize } from '../../database/sequelize.js';
import { ICalificacionCoordinacionRepository } from '../../../domain/interfaces/repositories/ICalificacionCoordinacionRepository.js';

/**
 * Lecturas de coordinación y cursos docente (vistas 104, 106, 108, 109, 107).
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo views/).
 */
export class CalificacionCoordinacionRepository extends ICalificacionCoordinacionRepository {
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
        SUM(f.tiene_registro) AS con_registro,
        SUM(
          CASE
            WHEN f.tiene_registro = 1 AND f.nota_efectiva >= ?
            THEN 1
            ELSE 0
          END
        ) AS aprobados,
        SUM(
          CASE
            WHEN f.tiene_registro = 1 AND f.nota_efectiva < ?
            THEN 1
            ELSE 0
          END
        ) AS reprobados,
        SUM(
          CASE
            WHEN f.tiene_registro = 0
            THEN 1
            ELSE 0
          END
        ) AS pendientes,
        SUM(CASE WHEN f.estado_bimestre = 'CERRADO' THEN 1 ELSE 0 END) AS cerrados,
        COALESCE(MAX(ev.cantidad_evaluaciones), 0) AS evaluaciones
      FROM vista_base_calificacion_resumen_curso_bimestre_fila f
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
        estudiante_id,
        codigo_estudiante,
        cedula,
        nombre_completo,
        matricula_materia_id,
        nota_final,
        bimestre,
        nota_teorico,
        nota_practico,
        nota_bimestre,
        habilitacion_teorico,
        habilitacion_practico,
        fecha_habilitacion,
        estado_bimestre
      FROM vista_base_calificacion_registro_notas_curso
      WHERE asignacion_docente_id = ?
      ORDER BY nombre_completo ASC, bimestre ASC
      `,
      { replacements: [asignacionId], type: sequelize.QueryTypes.SELECT },
    );
  }
}
