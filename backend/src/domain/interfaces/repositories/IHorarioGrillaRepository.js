/**
 * Interfaz de Repositorio (solo lectura): IHorarioGrillaRepository
 *
 * Fachada de lectura de la grilla horaria de un paralelo-gestión. Compone los
 * repositorios por vista (03-views/122–126). NO extiende IRepository.
 */
export class IHorarioGrillaRepository {
  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  findBloquesByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findBloquesByParaleloGestionId() must be implemented');
  }

  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  findCoberturaBloquesByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findCoberturaBloquesByParaleloGestionId() must be implemented');
  }

  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  findConflictosParaleloByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findConflictosParaleloByParaleloGestionId() must be implemented');
  }

  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  findConflictosAulaByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findConflictosAulaByParaleloGestionId() must be implemented');
  }

  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  findConflictosDocenteByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findConflictosDocenteByParaleloGestionId() must be implemented');
  }
}
