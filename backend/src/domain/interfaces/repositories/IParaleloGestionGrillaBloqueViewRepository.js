/**
 * Interfaz de Repositorio (solo lectura): IParaleloGestionGrillaBloqueViewRepository
 *
 * Lee los bloques de la grilla horaria por vista (03-views/122). NO extiende IRepository.
 */
export class IParaleloGestionGrillaBloqueViewRepository {
  /** @param {number} paraleloGestionId @returns {Promise<Array<Object>>} */
  async findByParaleloGestionId(paraleloGestionId) {
    throw new Error('Method findByParaleloGestionId() must be implemented');
  }

  /** @returns {Promise<Object|null>} */
  async findByAssignmentAndHorario(asignacionDocenteId, horarioId) {
    throw new Error('Method findByAssignmentAndHorario() must be implemented');
  }

  /** @returns {Promise<Object|null>} */
  async findOtherAssignmentAtHorario(paraleloGestionId, horarioId, asignacionDocenteId) {
    throw new Error('Method findOtherAssignmentAtHorario() must be implemented');
  }
}
