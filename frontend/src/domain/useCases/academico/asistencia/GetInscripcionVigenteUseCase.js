/**
 * Inscripción vigente de un estudiante (resuelve estudiante → inscripcionId
 * para la solicitud de licencia estudiantil).
 * Permiso: academico.asistencia.licencia.crear · CREAR.
 */
export class GetInscripcionVigenteUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {number|string} estudianteId
   */
  async ejecutar(estudianteId) {
    return this.asistenciaRepository.getInscripcionVigente(estudianteId);
  }
}
