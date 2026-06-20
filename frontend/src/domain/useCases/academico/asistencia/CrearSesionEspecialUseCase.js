/**
 * Habilita una fecha especial de clase (taller/recuperación; permite fecha futura).
 */
export class CrearSesionEspecialUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { fecha, motivo, horaInicio, horaFin } = {}) {
    return this.asistenciaRepository.crearSesionEspecial(asignacionId, {
      fecha,
      motivo,
      horaInicio,
      horaFin,
    });
  }
}
