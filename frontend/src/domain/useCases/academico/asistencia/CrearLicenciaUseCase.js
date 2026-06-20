/**
 * Solicitar una licencia estudiantil (estado inicial PENDIENTE en el backend).
 * El tope de días por gestión lo valida el backend; el front solo muestra el error.
 * Permiso: academico.asistencia.licencia.crear · CREAR.
 */
export class CrearLicenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {{ inscripcionId: number, fechaInicio: string, fechaFin: string,
   *   motivo: string, detalleMotivo: string }} payload
   */
  async ejecutar(payload) {
    return this.asistenciaRepository.crearLicencia(payload);
  }
}
