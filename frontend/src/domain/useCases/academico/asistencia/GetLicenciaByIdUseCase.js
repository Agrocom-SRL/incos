/**
 * Detalle de una licencia estudiantil.
 * Permiso: academico.asistencia.licencia.ver · DETALLE.
 */
export class GetLicenciaByIdUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {number|string} id
   */
  async ejecutar(id) {
    return this.asistenciaRepository.getLicenciaById(id);
  }
}
