/**
 * Catálogo para política institucional (carreras, periodos del plan).
 */

export class GetPoliticaCatalogoUseCase {
  /** @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  async ejecutar() {
    return this.calificacionRepository.obtenerPoliticaCatalogo();
  }
}
