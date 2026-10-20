import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';
import { IParaleloGestionAsignacionCoberturaBloquesViewRepository } from '../../../domain/interfaces/repositories/IParaleloGestionAsignacionCoberturaBloquesViewRepository.js';

const VIEW = 'vista_base_paralelo_gestion_asignacion_cobertura_bloques';

/**
 * Lectura: vista_base_paralelo_gestion_asignacion_cobertura_bloques (03-views/123).
 */
export class ParaleloGestionAsignacionCoberturaBloquesViewRepository
  extends IParaleloGestionAsignacionCoberturaBloquesViewRepository {
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
        asignacionDocenteId,
        asignatura,
        horasRequeridas,
        bloquesAsignados
      FROM ${VIEW}
      WHERE paraleloGestionId = :paraleloGestionId
      ORDER BY ordenVisualizacion ASC, asignacionDocenteId ASC
      `,
      { replacements: { paraleloGestionId: pgId }, type: QueryTypes.SELECT }
    );
  }
}
