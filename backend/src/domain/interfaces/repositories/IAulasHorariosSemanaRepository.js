/**
 * Interfaz de Repositorio (solo lectura): IAulasHorariosSemanaRepository
 *
 * Lee la ocupación semanal de aulas desde vista_aulas_horarios_semana (45).
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vista.
 */
export class IAulasHorariosSemanaRepository {
  /**
   * Bloques de ocupación de aulas en la semana (con filtros day/shift/classroomId).
   * @param {Object} filters
   * @param {number|null} page
   * @param {number|null} limit
   * @returns {Promise<{bloques: Array<Object>, total: number, page: number, limit: number}>}
   */
  async findAll(filters = {}, page = null, limit = null) {
    throw new Error('Method findAll() must be implemented');
  }
}
