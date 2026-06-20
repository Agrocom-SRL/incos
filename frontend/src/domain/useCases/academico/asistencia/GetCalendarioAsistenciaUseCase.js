/**
 * Calendario mensual del bimestre activo de un curso (toma de asistencia).
 * Días tomados (dot), días de clase, neutros y futuros vienen calculados del backend.
 */
export class GetCalendarioAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { bimestre } = {}) {
    return this.asistenciaRepository.getCalendario(asignacionId, { bimestre });
  }
}
