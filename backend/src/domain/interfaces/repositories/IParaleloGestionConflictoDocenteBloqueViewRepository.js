/**
 * Interfaz de Repositorio (solo lectura): IParaleloGestionConflictoDocenteBloqueViewRepository
 *
 * Lee conflictos de docente por bloque por vista. NO extiende IRepository.
 */
export class IParaleloGestionConflictoDocenteBloqueViewRepository {
  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  async findByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findByParaleloGestionId() must be implemented');
  }
}
