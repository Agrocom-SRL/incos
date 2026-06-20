/**
 * Cancelar una licencia (estado → CANCELADA). Solo desde PENDIENTE o APROBADA (lo valida el backend).
 * Permiso: academico.asistencia.licencia.crear · ELIMINAR.
 */
export class CancelarLicenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {number|string} id
   * @param {{ observacionesDecision?: string }} [payload]
   */
  async ejecutar(id, payload = {}) {
    return this.asistenciaRepository.cancelarLicencia(id, payload);
  }
}

export default CancelarLicenciaUseCase;
