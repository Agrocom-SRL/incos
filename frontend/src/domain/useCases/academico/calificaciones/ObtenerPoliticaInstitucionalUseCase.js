/**
 * Obtiene la política institucional de la gestión vigente.
 */

export class ObtenerPoliticaInstitucionalUseCase {
  /**
   * @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository
   */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  async ejecutar() {
    return this.calificacionRepository.obtenerPoliticaInstitucional();
  }
}
