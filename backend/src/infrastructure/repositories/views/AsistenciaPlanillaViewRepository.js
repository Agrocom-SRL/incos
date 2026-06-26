import { sequelize } from '../../database/sequelize.js';
import { IAsistenciaPlanillaViewRepository } from '../../../domain/interfaces/repositories/IAsistenciaPlanillaViewRepository.js';
import { ESTADOS_SESION_CLASE } from '../../../domain/constants/asistencia.constants.js';

/**
 * Lectura de celdas de la planilla (vista 133) y del roster (vista 110).
 * Arquetipo B (SOLO LECTURA sobre 03-views/).
 */
export class AsistenciaPlanillaViewRepository extends IAsistenciaPlanillaViewRepository {
  /** @param {number} asignacionDocenteId @param {string} desde @param {string} hasta */
  async listarCeldasPlanilla(asignacionDocenteId, desde, hasta) {
    return sequelize.query(
      `
      SELECT
        sesion_clase_id,
        asignacion_docente_id,
        periodo_academico_id,
        fecha_clase,
        es_especial,
        motivo,
        sesion_estado,
        matricula_materia_id,
        estudiante_id,
        estudiante_codigo,
        estudiante_nombre,
        estado,
        tiene_licencia
      FROM vista_base_asistencia_planilla_celda
      WHERE asignacion_docente_id = ?
        AND fecha_clase BETWEEN ? AND ?
      ORDER BY estudiante_nombre ASC, fecha_clase ASC
      `,
      { replacements: [asignacionDocenteId, desde, hasta], type: sequelize.QueryTypes.SELECT }
    );
  }

  /**
   * Licencias APROBADAS que cubren el rango, por matrícula del roster — INDEPENDIENTE de
   * sesiones (la vista 133 solo cruza licencias en días con sesión tomada). La licencia es
   * transversal a la inscripción: aplica a TODAS las materias del estudiante en esas fechas.
   * @param {number} asignacionDocenteId @param {string} desde @param {string} hasta
   * @returns {Promise<Array<{ matricula_materia_id: number, fecha_inicio: string, fecha_fin: string }>>}
   */
  async listarLicenciasRoster(asignacionDocenteId, desde, hasta) {
    return sequelize.query(
      `
      SELECT
        r.matricula_materia_id,
        l.fecha_inicio,
        l.fecha_fin
      FROM vista_base_calificacion_estudiante_matricula_curso r
      INNER JOIN matriculas_materia mm
        ON mm.id = r.matricula_materia_id
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      INNER JOIN licencias l
        ON l.inscripcion_id = mm.inscripcion_id
        AND l.estado = 'APROBADA'
        AND l.activo = TRUE
        AND l.deleted_at IS NULL
        AND l.fecha_inicio <= ?
        AND l.fecha_fin >= ?
      WHERE r.asignacion_docente_id = ?
      `,
      { replacements: [hasta, desde, asignacionDocenteId], type: sequelize.QueryTypes.SELECT }
    );
  }

  /**
   * Agregado de asistencia del BIMESTRE por estudiante, para calcular el % de asistencia.
   *
   *   sesiones_tomadas           = sesiones CERRADAS del curso en el periodo del bimestre que SÍ
   *                                cuentan (día no feriado/receso ni clase no dictada). Denominador
   *                                (100%). Las sesiones ABIERTAS no se computan todavía.
   *   faltas_no_neutralizadas    = AUSENTE/TARDANZA del estudiante en esas sesiones cerradas, descontando
   *                                las que el estudiante neutraliza con licencia APROBADA vigente.
   *
   * Feriados/receso salen del cronograma (suspende_clases = TRUE); clases no dictadas de
   * `clases_no_dictadas`; licencias de `licencias` (APROBADA, por inscripción, rango cubre la fecha).
   *
   * @param {number} asignacionDocenteId
   * @param {number} periodoAcademicoId
   * @param {number} gestionId
   * @param {string} desde fecha ISO inicio del bimestre
   * @param {string} hasta fecha ISO fin del bimestre
   * @returns {Promise<Array<{ matricula_materia_id:number, estudiante_id:number, sesiones_tomadas:number, faltas_no_neutralizadas:number }>>}
   */
  async listarAsistenciaBimestreCurso(
    asignacionDocenteId,
    periodoAcademicoId,
    gestionId,
    desde,
    hasta
  ) {
    // Sesiones del curso en el bimestre que SÍ cuentan para el % de asistencia:
    //   - estado CERRADA (registro firmado): las ABIERTA aún se están tomando y NO
    //     forman parte del 100% ni descuentan faltas todavía.
    //   - día no feriado/receso (cronograma) ni clase no dictada.
    // Subconsulta reutilizada como denominador y como universo de faltas.
    const sesionesValidas = `
      SELECT sc.id AS sesion_clase_id, sc.fecha
      FROM sesiones_clase sc
      WHERE sc.asignacion_docente_id = ?
        AND sc.periodo_academico_id = ?
        AND sc.fecha BETWEEN ? AND ?
        AND sc.estado = '${ESTADOS_SESION_CLASE.CERRADA}'
        AND sc.activo = TRUE
        AND sc.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM vista_base_cronograma_gestion cg
          WHERE cg.gestion_id = ?
            AND cg.suspende_clases = TRUE
            AND sc.fecha BETWEEN cg.fecha_inicio AND COALESCE(cg.fecha_fin, cg.fecha_inicio)
        )
        AND NOT EXISTS (
          SELECT 1 FROM clases_no_dictadas cnd
          WHERE cnd.asignacion_docente_id = sc.asignacion_docente_id
            AND cnd.fecha_clase = sc.fecha
            AND cnd.activo = TRUE
            AND cnd.deleted_at IS NULL
        )
    `;
    return sequelize.query(
      `
      SELECT
        r.matricula_materia_id,
        r.estudiante_id,
        (SELECT COUNT(*) FROM (${sesionesValidas}) sv_cnt) AS sesiones_tomadas,
        COALESCE(SUM(
          CASE
            WHEN asi.estado IN ('AUSENTE', 'TARDANZA')
              AND NOT EXISTS (
                SELECT 1 FROM licencias l
                WHERE l.inscripcion_id = mm.inscripcion_id
                  AND l.estado = 'APROBADA'
                  AND l.activo = TRUE
                  AND l.deleted_at IS NULL
                  AND sv.fecha BETWEEN l.fecha_inicio AND l.fecha_fin
              )
            -- AUSENTE penaliza 1 clase completa; TARDANZA media falta (0.5).
            THEN CASE WHEN asi.estado = 'TARDANZA' THEN 0.5 ELSE 1 END
            ELSE 0
          END
        ), 0) AS faltas_no_neutralizadas
      FROM vista_base_calificacion_estudiante_matricula_curso r
      INNER JOIN matriculas_materia mm
        ON mm.id = r.matricula_materia_id
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      CROSS JOIN (${sesionesValidas}) sv
      LEFT JOIN asistencias asi
        ON asi.sesion_clase_id = sv.sesion_clase_id
        AND asi.matricula_materia_id = r.matricula_materia_id
        AND asi.deleted_at IS NULL
        AND asi.activo = TRUE
      WHERE r.asignacion_docente_id = ?
      GROUP BY r.matricula_materia_id, r.estudiante_id
      `,
      {
        replacements: [
          // subconsulta del COUNT (denominador)
          asignacionDocenteId,
          periodoAcademicoId,
          desde,
          hasta,
          gestionId,
          // subconsulta del CROSS JOIN (universo de faltas)
          asignacionDocenteId,
          periodoAcademicoId,
          desde,
          hasta,
          gestionId,
          // filtro del roster
          asignacionDocenteId
        ],
        type: sequelize.QueryTypes.SELECT
      }
    );
  }

  /** @param {number} asignacionDocenteId */
  async listarRoster(asignacionDocenteId) {
    return sequelize.query(
      `
      SELECT
        matricula_materia_id,
        estudiante_id,
        codigo AS estudiante_codigo,
        nombre AS estudiante_nombre
      FROM vista_base_calificacion_estudiante_matricula_curso
      WHERE asignacion_docente_id = ?
      ORDER BY nombre ASC
      `,
      { replacements: [asignacionDocenteId], type: sequelize.QueryTypes.SELECT }
    );
  }
}

export default AsistenciaPlanillaViewRepository;
