import { sequelize } from '../../database/sequelize.js';
import { ICalificacionCentralizadorRepository } from '../../../domain/interfaces/repositories/ICalificacionCentralizadorRepository.js';

/**
 * Lectura del centralizador de calificaciones por paralelo (vista base 135).
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo views/).
 *
 * Formato LARGO: una fila por (estudiante × oferta_curso) del paralelo. El
 * pivote a matriz (estudiantes × asignaturas) se hace en el use case.
 */
export class CalificacionCentralizadorRepository extends ICalificacionCentralizadorRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async listarFilasCentralizadorPorParaleloGestion(paraleloGestionId) {
    return sequelize.query(
      `
      SELECT *
      FROM vista_base_calificacion_centralizador_paralelo_fila
      WHERE paralelo_gestion_id = ?
      ORDER BY nombre_completo ASC, asignatura_orden ASC
      `,
      { replacements: [paraleloGestionId], type: sequelize.QueryTypes.SELECT },
    );
  }
}
