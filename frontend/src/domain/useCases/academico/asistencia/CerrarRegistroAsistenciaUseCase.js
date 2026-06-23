/**
 * Cierra el registro de asistencia: por DÍA si llega `fecha` (una sesión), o en lote por bimestre.
 */
export class CerrarRegistroAsistenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  async ejecutar(asignacionId, { bimestre, fecha } = {}) {
    return this.asistenciaRepository.cerrarRegistro(asignacionId, { bimestre, fecha });
  }
}
