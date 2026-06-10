import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IParaleloGestionRepository
 *
 * Contrato del repositorio de paralelos en gestión (paralelos_gestion). Arquetipo
 * CRUD (extiende IRepository) más lecturas enriquecidas (delegadas a la vista 127)
 * y consultas de contexto para generación de oferta. La implementación
 * (ParallelManagementRepository) hereda el CRUD de BaseRepository.
 */
export class IParaleloGestionRepository extends IRepository {
  /** @param {number} managementPlanId @returns {Promise<Array<Object>>} */
  findEnrichedByManagementPlanId(managementPlanId) {
    throw new Error('Method findEnrichedByManagementPlanId() must be implemented');
  }

  /** @param {number} id @returns {Promise<Object|null>} */
  findEnrichedById(id) {
    throw new Error('Method findEnrichedById() must be implemented');
  }

  /** @param {number} gestionId @returns {Promise<Array<Object>>} */
  findEnrichedOfertadoByGestionId(gestionId) {
    throw new Error('Method findEnrichedOfertadoByGestionId() must be implemented');
  }

  /** @param {number} parallelId @returns {Promise<Array<Object>>} */
  findEnrichedByParallelId(parallelId) {
    throw new Error('Method findEnrichedByParallelId() must be implemented');
  }

  /** @param {number} managementPlanId @returns {Promise<number[]>} */
  async findExistingParallelIds(managementPlanId) {
    throw new Error('Method findExistingParallelIds() must be implemented');
  }

  /** @param {number} parallelManagementId @returns {Promise<Object|null>} */
  async findGenerationContext(parallelManagementId) {
    throw new Error('Method findGenerationContext() must be implemented');
  }

  /** @param {number} parallelManagementId @returns {Promise<number[]>} */
  async findExistingPlanSubjectIds(parallelManagementId) {
    throw new Error('Method findExistingPlanSubjectIds() must be implemented');
  }

  /** @param {number} parallelId @param {number} managementPlanId @returns {Promise<Object|null>} */
  async findByParallelAndManagementPlan(parallelId, managementPlanId) {
    throw new Error('Method findByParallelAndManagementPlan() must be implemented');
  }
}
