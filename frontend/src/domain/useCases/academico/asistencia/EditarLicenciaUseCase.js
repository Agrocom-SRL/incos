/**
 * Editar una licencia PENDIENTE (motivo, detalle y rango de fechas).
 * Permiso: academico.asistencia.licencia.crear · EDITAR.
 * La regla "solo desde PENDIENTE" y el tope de 15 días los valida el backend.
 */
export class EditarLicenciaUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {number|string} id
   * @param {{ fechaInicio: string, fechaFin: string, motivo: string, detalleMotivo: string }} payload
   */
  async ejecutar(id, payload) {
    return this.asistenciaRepository.editarLicencia(id, payload);
  }
}

export default EditarLicenciaUseCase;
