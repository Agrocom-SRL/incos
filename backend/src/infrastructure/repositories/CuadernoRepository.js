import { sequelize } from '../database/sequelize.js';
import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';

/**
 * Consultas del cuaderno bimestral (evaluaciones + notas cargadas).
 */
export class CuadernoRepository {
  constructor() {
    this.contexto = new CalificacionContextoRepository();
  }

  /**
   * @param {number} gestionId
   * @param {number} bimestreNumero 1-4
   * @returns {Promise<number|null>}
   */
  async obtenerPeriodoAcademicoId(gestionId, bimestreNumero) {
    const rows = await sequelize.query(
      `
      SELECT periodo_academico_id AS id
      FROM vista_base_calificacion_periodos_bimestre
      WHERE gestion_id = ?
        AND numero_orden = ?
      LIMIT 1
      `,
      {
        replacements: [gestionId, bimestreNumero],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0]?.id != null ? Number(rows[0].id) : null;
  }

  /**
   * @param {number} asignacionId
   * @param {number} periodoAcademicoId
   */
  async listarEvaluaciones(asignacionId, periodoAcademicoId) {
    return sequelize.query(
      `
      SELECT
        e.id,
        e.tipo_evaluacion_id,
        e.componente,
        e.nombre_evaluacion,
        e.peso,
        e.fecha,
        e.notas_cerradas,
        e.activo,
        e.created_at,
        e.updated_at
      FROM evaluaciones e
      WHERE e.asignacion_docente_id = ?
        AND e.periodo_academico_id = ?
        AND e.deleted_at IS NULL
        AND e.activo = TRUE
      ORDER BY e.id ASC
      `,
      {
        replacements: [asignacionId, periodoAcademicoId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * Notas ya cargadas (carga perezosa) para poblar la grilla.
   */
  async listarNotasCuaderno(asignacionId, bimestreNumero) {
    return sequelize.query(
      `
      SELECT
        est.id AS estudiante_id,
        en.evaluacion_id,
        en.nota
      FROM evaluaciones_notas en
      INNER JOIN evaluaciones ev
        ON ev.id = en.evaluacion_id
        AND ev.deleted_at IS NULL
        AND ev.activo = TRUE
      INNER JOIN bimestres_matricula bm
        ON bm.id = en.bimestre_matricula_id
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
        AND bm.bimestre = ?
      INNER JOIN matriculas_materia mm
        ON mm.id = bm.matricula_materia_id
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
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
      WHERE ev.asignacion_docente_id = ?
        AND en.deleted_at IS NULL
        AND en.activo = TRUE
        AND en.nota IS NOT NULL
      `,
      {
        replacements: [bimestreNumero, asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * @param {number} evaluacionId
   * @param {number} asignacionId
   */
  async obtenerEvaluacionDeAsignacion(evaluacionId, asignacionId) {
    const rows = await sequelize.query(
      `
      SELECT
        e.id,
        e.asignacion_docente_id,
        e.periodo_academico_id,
        e.tipo_evaluacion_id,
        e.componente,
        e.nombre_evaluacion,
        e.peso,
        e.fecha,
        e.notas_cerradas
      FROM evaluaciones e
      WHERE e.id = ?
        AND e.asignacion_docente_id = ?
        AND e.deleted_at IS NULL
        AND e.activo = TRUE
      LIMIT 1
      `,
      {
        replacements: [evaluacionId, asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0] ?? null;
  }
}

export default CuadernoRepository;
