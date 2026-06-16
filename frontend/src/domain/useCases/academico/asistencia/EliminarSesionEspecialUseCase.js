/**
 * Elimina una sesión especial (solo si no tiene asistencia tomada; lo valida el backend).
 */
export class EliminarSesionEspecialUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, fecha) {
    return this.asistenciaRepository.eliminarSesionEspecial(asignacionId, fecha);
  }
}
