/**
 * Listado de docentes para coordinación de calificaciones.
 */

export class ListCoordinacionDocentesUseCase {
  /**
   * @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository
   */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  /**
   * @param {Object} options
   * @param {string} [options.q]
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar]
   */
  async ejecutar(options = {}) {
    const { q = '', limit, preliminar } = options;
    return this.calificacionRepository.listarCoordinacionDocentes({ q, limit, preliminar });
  }
}
