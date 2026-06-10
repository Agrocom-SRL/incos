/**
 * Interfaz de Repositorio (solo lectura): IParaleloGestionConflictoAulaBloqueViewRepository
 *
 * Lee conflictos de aula por bloque por vista. NO extiende IRepository.
 */
export class IParaleloGestionConflictoAulaBloqueViewRepository {
  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  async findByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findByParaleloGestionId() must be implemented');
  }
}
