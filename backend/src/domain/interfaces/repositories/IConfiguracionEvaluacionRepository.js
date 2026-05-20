import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IConfiguracionEvaluacionRepository
 *
 * Tabla: configuracion_evaluacion (clave-valor por gestión, ver 13-evaluaciones.sql)
 * Clave principal: POLITICA_INSTITUCIONAL (JSON en columna valor, vigente=TRUE)
 */
export class IConfiguracionEvaluacionRepository extends IRepository {
  /**
   * @param {number} gestionId
   * @returns {Promise<Object|null>}
   */
  async findActiveRowByGestionId(gestionId) {
    throw new Error('Method findActiveRowByGestionId must be implemented');
  }

  /**
   * @param {number} gestionId
   * @param {Object} documento
   * @param {number|null} userId
   * @returns {Promise<number>}
   */
  async upsertPoliticaVigente(gestionId, documento, userId = null) {
    throw new Error('Method upsertPoliticaVigente must be implemented');
  }
}
