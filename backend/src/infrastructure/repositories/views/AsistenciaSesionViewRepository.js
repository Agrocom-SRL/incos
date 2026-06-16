import { sequelize } from '../../database/sequelize.js';
import { IAsistenciaSesionViewRepository } from '../../../domain/interfaces/repositories/IAsistenciaSesionViewRepository.js';

/**
 * Lectura de días tomados (vista 132). Arquetipo B (SOLO LECTURA sobre 03-views/).
 */
export class AsistenciaSesionViewRepository extends IAsistenciaSesionViewRepository {
  /** @param {number} asignacionDocenteId @param {string} desde @param {string} hasta */
  async listarDiasTomados(asignacionDocenteId, desde, hasta) {
    return sequelize.query(
      `
      SELECT
        sesion_clase_id,
        asignacion_docente_id,
        periodo_academico_id,
        fecha,
        hora_inicio,
        hora_fin,
        es_especial,
        motivo,
        sesion_estado
      FROM vista_base_asistencia_sesion_dia_tomado
      WHERE asignacion_docente_id = ?
        AND fecha BETWEEN ? AND ?
      ORDER BY fecha ASC
      `,
      { replacements: [asignacionDocenteId, desde, hasta], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Bloques de horario regular del curso (vista 128). @param {number} asignacionDocenteId */
  async listarBloquesHorario(asignacionDocenteId) {
    return sequelize.query(
      `
      SELECT DISTINCT
        dia,
        hora_inicio,
        hora_fin
      FROM vista_base_docente_curso_bloques_horario
      WHERE asignacion_docente_id = ?
        AND dia IS NOT NULL
      ORDER BY hora_inicio ASC
      `,
      { replacements: [asignacionDocenteId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Feriados del calendario (gestión) que solapan el rango (vista 129). */
  async listarFeriadosCalendario(gestionId, desde, hasta) {
    return sequelize.query(
      `
      SELECT
        fecha_inicio,
        fecha_fin,
        nombre,
        tipo
      FROM vista_base_cronograma_gestion
      WHERE gestion_id = ?
        AND tipo = 'FERIADO'
        AND fecha_inicio <= ?
        AND COALESCE(fecha_fin, fecha_inicio) >= ?
      `,
      { replacements: [gestionId, hasta, desde], type: sequelize.QueryTypes.SELECT },
    );
  }

  /** Clases no dictadas del curso en el rango. */
  async listarClasesNoDictadas(asignacionDocenteId, desde, hasta) {
    return sequelize.query(
      `
      SELECT
        fecha_clase,
        motivo
      FROM clases_no_dictadas
      WHERE asignacion_docente_id = ?
        AND fecha_clase BETWEEN ? AND ?
        AND activo = TRUE
        AND deleted_at IS NULL
      `,
      { replacements: [asignacionDocenteId, desde, hasta], type: sequelize.QueryTypes.SELECT },
    );
  }
}

export default AsistenciaSesionViewRepository;
