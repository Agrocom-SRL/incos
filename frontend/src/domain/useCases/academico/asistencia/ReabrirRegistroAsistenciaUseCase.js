/**
 * Reabre el registro de asistencia del bimestre (lote de sesiones → modo corrección).
 */
export class ReabrirRegistroAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { bimestre } = {}) {
    return this.asistenciaRepository.reabrirRegistro(asignacionId, { bimestre });
  }
}
