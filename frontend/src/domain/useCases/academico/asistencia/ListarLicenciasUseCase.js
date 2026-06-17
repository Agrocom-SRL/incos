/**
 * Listado de licencias estudiantiles (Académico · ítem ACA-ASI, página dentro de Asistencia).
 * Filtro opcional por estado (PENDIENTE/APROBADA/RECHAZADA/CANCELADA).
 * Permiso: academico.asistencia.licencia.ver · LISTAR.
 */
export class ListarLicenciasUseCase {
  constructor(asistenciaRepository) {
    this.asistenciaRepository = asistenciaRepository;
  }

  /**
   * @param {{ estado?: string }} [options]
   */
  async ejecutar({ estado } = {}) {
    return this.asistenciaRepository.listarLicencias({ estado });
  }
}
