import { sequelize } from '../../database/sequelize.js';
import { INivelacionParaleloViewRepository } from '../../../domain/interfaces/repositories/INivelacionParaleloViewRepository.js';

/**
 * Lectura de eventos de historial de matrícula por paralelo (vista base 185).
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo views/).
 */
export class NivelacionParaleloViewRepository extends INivelacionParaleloViewRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async listarEventosPorParaleloGestion(paraleloGestionId) {
    return sequelize.query(
      `
      SELECT *
      FROM vista_base_nivelacion_paralelo_fila
      WHERE paralelo_gestion_id = ?
      ORDER BY nombre_completo ASC, asignatura_sigla ASC
      `,
      { replacements: [paraleloGestionId], type: sequelize.QueryTypes.SELECT },
    );
  }
}

export default NivelacionParaleloViewRepository;
