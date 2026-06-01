import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

const VIEW = 'vista_base_paralelo_gestion_conflicto_paralelo_bloque';

/**
 * Lectura: vista_base_paralelo_gestion_conflicto_paralelo_bloque (03-views/124).
 */
export class ParaleloGestionConflictoParaleloBloqueViewRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async findByParaleloGestionId(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) return [];

    return sequelize.query(
      `
      SELECT horarioId, asignacionIds
      FROM ${VIEW}
      WHERE paraleloGestionId = :paraleloGestionId
      ORDER BY horarioId ASC
      `,
      { replacements: { paraleloGestionId: pgId }, type: QueryTypes.SELECT }
    );
  }
}
