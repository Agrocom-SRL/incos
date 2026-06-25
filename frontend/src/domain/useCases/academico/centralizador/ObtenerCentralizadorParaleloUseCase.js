/**
 * Centralizador de calificaciones por paralelo (matriz estudiantes × asignaturas).
 */

export class ObtenerCentralizadorParaleloUseCase {
  /**
   * @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository
   */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   */
  async ejecutar({ paraleloGestionId } = {}) {
    return this.calificacionRepository.obtenerCentralizador({ paraleloGestionId });
  }
}
