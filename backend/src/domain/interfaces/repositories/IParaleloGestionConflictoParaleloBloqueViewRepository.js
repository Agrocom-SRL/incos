/**
 * Interfaz de Repositorio (solo lectura): IParaleloGestionConflictoParaleloBloqueViewRepository
 *
 * Lee conflictos de paralelo por bloque por vista. NO extiende IRepository.
 */
export class IParaleloGestionConflictoParaleloBloqueViewRepository {
  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  async findByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findByParaleloGestionId() must be implemented');
  }
}
