/**
 * Reabre el registro de asistencia: por DÍA si llega `fecha` (una sesión), o en lote por bimestre.
 */
export class ReabrirRegistroAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { bimestre, fecha } = {}) {
    return this.asistenciaRepository.reabrirRegistro(asignacionId, { bimestre, fecha });
  }
}
