/**
 * Cierra el registro de asistencia del bimestre (lote de sesiones → solo lectura).
 */
export class CerrarRegistroAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { bimestre } = {}) {
    return this.asistenciaRepository.cerrarRegistro(asignacionId, { bimestre });
  }
}
