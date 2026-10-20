import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';
import { IParaleloGestionConflictoAulaBloqueViewRepository } from '../../../domain/interfaces/repositories/IParaleloGestionConflictoAulaBloqueViewRepository.js';

const VIEW = 'vista_base_paralelo_gestion_conflicto_aula_bloque';

/**
 * Lectura: vista_base_paralelo_gestion_conflicto_aula_bloque (03-views/125).
 */
export class ParaleloGestionConflictoAulaBloqueViewRepository
  extends IParaleloGestionConflictoAulaBloqueViewRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async findByParaleloGestionId(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) return [];

    return sequelize.query(
      `
      SELECT horarioId, aulaId, asignacionIds
      FROM ${VIEW}
      WHERE paraleloGestionId = :paraleloGestionId
      ORDER BY horarioId ASC, aulaId ASC
      `,
      { replacements: { paraleloGestionId: pgId }, type: QueryTypes.SELECT }
    );
  }
}
