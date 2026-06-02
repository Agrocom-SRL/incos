import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database/sequelize.js';

const VIEW = 'vista_base_paralelo_gestion_ficha';

const ACTIVE_FILTER = 'deletedAt IS NULL';

/**
 * Lectura: vista_base_paralelo_gestion_ficha (03-views/127).
 */
export class ParaleloGestionFichaViewRepository {
  /**
   * @param {number} managementPlanId
   * @returns {Promise<Array<Object>>}
   */
  async findByManagementPlanId(managementPlanId) {
    const planId = Number(managementPlanId);
    if (!Number.isFinite(planId) || planId < 1) return [];

    return sequelize.query(
      `
      SELECT *
      FROM ${VIEW}
      WHERE gestionPlanId = :managementPlanId
        AND ${ACTIVE_FILTER}
      ORDER BY paraleloNombre ASC, id ASC
      `,
      { replacements: { managementPlanId: planId }, type: QueryTypes.SELECT }
    );
  }

  /**
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const pgId = Number(id);
    if (!Number.isFinite(pgId) || pgId < 1) return null;

    const rows = await sequelize.query(
      `
      SELECT *
      FROM ${VIEW}
      WHERE id = :id
        AND ${ACTIVE_FILTER}
      LIMIT 1
      `,
      { replacements: { id: pgId }, type: QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

  /**
   * @param {number} parallelId
   * @returns {Promise<Array<Object>>}
   */
  async findByParallelId(parallelId) {
    const pId = Number(parallelId);
    if (!Number.isFinite(pId) || pId < 1) return [];

    return sequelize.query(
      `
      SELECT *
      FROM ${VIEW}
      WHERE paraleloId = :parallelId
        AND ${ACTIVE_FILTER}
      ORDER BY gestionAnio DESC, gestionCodigo ASC, turno ASC, id ASC
      `,
      { replacements: { parallelId: pId }, type: QueryTypes.SELECT }
    );
  }

  /**
   * Paralelos-gestión en OFERTADO de una gestión académica.
   * @param {number} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findOfertadoByGestionId(gestionId) {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) return [];

    return sequelize.query(
      `
      SELECT
        id,
        gestionPlanId,
        paraleloId,
        turno,
        estado,
        paraleloNombre
      FROM ${VIEW}
      WHERE gestionId = :gestionId
        AND ${ACTIVE_FILTER}
        AND activo = TRUE
        AND UPPER(estado) = 'OFERTADO'
      ORDER BY paraleloNombre ASC, turno ASC, id ASC
      `,
      { replacements: { gestionId: gId }, type: QueryTypes.SELECT }
    );
  }
}
