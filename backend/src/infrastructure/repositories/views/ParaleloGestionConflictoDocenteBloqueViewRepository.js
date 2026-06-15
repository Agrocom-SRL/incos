import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';
import { IParaleloGestionConflictoDocenteBloqueViewRepository } from '../../../domain/interfaces/repositories/IParaleloGestionConflictoDocenteBloqueViewRepository.js';

const VIEW = 'vista_base_paralelo_gestion_conflicto_docente_bloque';

/**
 * Lectura: vista_base_paralelo_gestion_conflicto_docente_bloque (03-views/126).
 */
export class ParaleloGestionConflictoDocenteBloqueViewRepository extends IParaleloGestionConflictoDocenteBloqueViewRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async findByParaleloGestionId(paraleloGestionId) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) return [];

    return sequelize.query(
      `
      SELECT
        horarioId,
        asignacionId1,
        asignacionId2,
        docenteId,
        docenteNombre
      FROM ${VIEW}
      WHERE paraleloGestionId1 = :paraleloGestionId
         OR paraleloGestionId2 = :paraleloGestionId
      ORDER BY horarioId ASC, asignacionId1 ASC, asignacionId2 ASC
      `,
      { replacements: { paraleloGestionId: pgId }, type: QueryTypes.SELECT }
    );
  }
}
