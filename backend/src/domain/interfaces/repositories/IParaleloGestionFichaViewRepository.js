/**
 * Interfaz de Repositorio (solo lectura): IParaleloGestionFichaViewRepository
 *
 * Lee vista_base_paralelo_gestion_ficha (03-views/127). NO extiende IRepository.
 */
export class IParaleloGestionFichaViewRepository {
  /** @param {number} managementPlanId @returns {Promise<Array<Object>>} */
  async findByManagementPlanId(managementPlanId) {
    throw new Error('Method findByManagementPlanId() must be implemented');
  }

  /** @param {number} id @returns {Promise<Object|null>} */
  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  /** @param {number} parallelId @returns {Promise<Array<Object>>} */
  async findByParallelId(parallelId) {
    throw new Error('Method findByParallelId() must be implemented');
  }

  /** @param {number} gestionId @returns {Promise<Array<Object>>} */
  async findOfertadoByGestionId(gestionId) {
    throw new Error('Method findOfertadoByGestionId() must be implemented');
  }
}
