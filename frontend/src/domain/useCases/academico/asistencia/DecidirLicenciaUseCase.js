/**
 * Aprobar o rechazar una licencia PENDIENTE (la regla "solo desde PENDIENTE" la valida el backend).
 * Permiso: academico.asistencia.licencia.aprobar · APROBAR.
 */
export class DecidirLicenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {number|string} id
   * @param {{ decision: 'APROBAR'|'RECHAZAR', observacionesDecision?: string }} payload
   */
  async ejecutar(id, payload) {
    return this.asistenciaRepository.decidirLicencia(id, payload);
  }
}
