/**
 * Guarda la política institucional de la gestión vigente.
 */

export class GuardarPoliticaInstitucionalUseCase {
  /**
   * @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository
   */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  /**
   * @param {Object} cambios
   */
  async ejecutar(cambios) {
    return this.calificacionRepository.guardarPoliticaInstitucional(cambios);
  }
}
