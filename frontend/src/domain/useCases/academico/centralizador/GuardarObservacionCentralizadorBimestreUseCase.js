/**
 * Guarda la observación del bimestre en el centralizador (bimestres_matricula).
 */

export class GuardarObservacionCentralizadorBimestreUseCase {
  /**
   * @param {import('@infrastructure/repositories/CalificacionRepository.js').default} calificacionRepository
   */
  constructor(calificacionRepository) {
    this.calificacionRepository = calificacionRepository;
  }

  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   * @param {number} params.bimestre
   * @param {number} params.estudianteId
   * @param {string|null} params.observacion
   */
  async ejecutar({ paraleloGestionId, bimestre, estudianteId, observacion } = {}) {
    return this.calificacionRepository.guardarObservacionCentralizadorBimestre({
      paraleloGestionId,
      bimestre,
      estudianteId,
      observacion,
    });
  }
}
