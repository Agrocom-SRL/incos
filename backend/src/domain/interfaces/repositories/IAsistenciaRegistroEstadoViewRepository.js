/**
 * Interfaz de Repositorio (SOLO LECTURA): IAsistenciaRegistroEstadoViewRepository.
 *
 * Lee el estado agregado del registro por curso × bimestre desde
 * `vista_base_asistencia_registro_estado_bimestre` (134), derivado de sesiones_clase
 * (ABIERTO/CERRADO). Patrón de la vista 114.
 *
 * NO extiende IRepository: arquetipo B (lectura sobre 03-views/).
 */
export class IAsistenciaRegistroEstadoViewRepository {
  /**
   * Estado del registro de un curso en un bimestre.
   * @returns {Promise<{ registro_estado: string, total_sesiones: number,
   *   sesiones_cerradas: number }|null>}
   */
  async obtenerEstadoBimestre(_asignacionDocenteId, _periodoAcademicoId) {
    throw new Error('Method obtenerEstadoBimestre() must be implemented');
  }
}
