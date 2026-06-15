import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IOfertaCursoRepository
 *
 * Contrato del repositorio de oferta de cursos (oferta_cursos). Arquetipo CRUD
 * (extiende IRepository) más lecturas enriquecidas/validación propias del
 * agregado de oferta. La implementación (CourseOfferRepository) hereda el CRUD
 * de BaseRepository y declara estos métodos extra.
 */
export class IOfertaCursoRepository extends IRepository {
  /** @param {number} parallelManagementId @returns {Promise<Array<Object>>} */
  async findEnrichedByParallelManagementId(parallelManagementId) {
    throw new Error('Method findEnrichedByParallelManagementId() must be implemented');
  }

  /** @returns {Promise<{expected: Array<Object>, actual: Array<Object>}>} */
  async findValidationBundle(parallelManagementId, studyPlanId, periodId) {
    throw new Error('Method findValidationBundle() must be implemented');
  }

  /** @param {number} offerId @returns {Promise<number>} */
  async countActiveEnrollmentsByOfferId(offerId) {
    throw new Error('Method countActiveEnrollmentsByOfferId() must be implemented');
  }

  /** @returns {Promise<{rows: Array<Object>, total: number}>} */
  async findCatalogByParallelManagementId(parallelManagementId, opts) {
    throw new Error('Method findCatalogByParallelManagementId() must be implemented');
  }

  /** @returns {Promise<{rows: Array<Object>, total: number}>} */
  async findCatalogByManagementPlanId(managementPlanId, opts) {
    throw new Error('Method findCatalogByManagementPlanId() must be implemented');
  }

  /** @param {number} parallelManagementId @returns {Promise<Object>} */
  async findCoberturaDocenteByParallelManagementId(parallelManagementId) {
    throw new Error('Method findCoberturaDocenteByParallelManagementId() must be implemented');
  }

  /** @param {number} gestionId @returns {Promise<Object>} */
  async findCoberturaTotalesByGestionId(gestionId) {
    throw new Error('Method findCoberturaTotalesByGestionId() must be implemented');
  }
}
