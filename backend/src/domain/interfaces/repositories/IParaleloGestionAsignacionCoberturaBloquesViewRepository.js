/**
 * Interfaz de Repositorio (solo lectura): IParaleloGestionAsignacionCoberturaBloquesViewRepository
 *
 * Lee la cobertura de bloques por asignación docente por vista. NO extiende IRepository.
 */
export class IParaleloGestionAsignacionCoberturaBloquesViewRepository {
  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  async findByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findByParaleloGestionId() must be implemented');
  }
}
