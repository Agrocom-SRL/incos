/**
 * Registra un evento genérico de historial_matricula (tipos sin nota:
 * bloqueo/cronología). ABANDONO/RETIRADO usan
 * `RegistrarDecisionAdministrativaUseCase` (endpoint separado, permiso
 * `academico.nivelacion.aprobar`).
 */

export class RegistrarEventoHistorialUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  /**
   * @param {Object} payload - { subjectEnrollmentId? , enrollmentId?, planSubjectId?,
   *   stateType, transitionDate?, resultingGrade?, forcedGrade?, observations? }
   */
  async ejecutar(payload) {
    return this.nivelacionRepository.registrarEvento(payload);
  }
}

export default RegistrarEventoHistorialUseCase;
