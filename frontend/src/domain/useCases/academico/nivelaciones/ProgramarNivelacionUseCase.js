/**
 * Programa un examen de nivelación (tipos con examen: NIVELACION_1RA/2DA,
 * PRUEBA_EXCEPCIONAL, RECUPERATORIO_ANUAL, ARTICULO_18). Crea el evento de
 * historial + la fila `nivelaciones` en estado PROGRAMADA, en una sola
 * llamada.
 */

export class ProgramarNivelacionUseCase {
  /**
   * @param {import('@infrastructure/repositories/NivelacionRepository.js').default} nivelacionRepository
   */
  constructor(nivelacionRepository) {
    this.nivelacionRepository = nivelacionRepository;
  }

  /**
   * @param {Object} payload - { subjectEnrollmentId?, enrollmentId?, planSubjectId?,
   *   stateType, transitionDate?, observations?, managementId?, evaluatorTeacherId?, examDate? }
   */
  async ejecutar(payload) {
    return this.nivelacionRepository.programarExamen(payload);
  }
}

export default ProgramarNivelacionUseCase;
