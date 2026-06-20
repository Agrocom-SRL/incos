/**
 * Planilla semanal de un curso (roster × días válidos del rango).
 * El orden de las filas viene del backend; no se reordena.
 */
export class GetPlanillaAsistenciaSemanalUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { desde, hasta } = {}) {
    return this.asistenciaRepository.getPlanilla(asignacionId, { desde, hasta });
  }
}
