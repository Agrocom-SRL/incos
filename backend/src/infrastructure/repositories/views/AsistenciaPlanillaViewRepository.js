import { sequelize } from '../../database/sequelize.js';
import { IAsistenciaPlanillaViewRepository } from '../../../domain/interfaces/repositories/IAsistenciaPlanillaViewRepository.js';

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
      { replacements: [asignacionDocenteId, desde, hasta], type: sequelize.QueryTypes.SELECT },
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
      { replacements: [asignacionDocenteId], type: sequelize.QueryTypes.SELECT },
    );
  }
}

export default AsistenciaPlanillaViewRepository;
