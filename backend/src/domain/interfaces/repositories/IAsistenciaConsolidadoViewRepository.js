/**
 * Interfaz de Repositorio (SOLO LECTURA): IAsistenciaConsolidadoViewRepository.
 *
 * Lee el consolidado % de asistencia desde
 * `vista_asistencia_consolidado_bimestre_fila` (169): una fila por
 * estudiante × curso × bimestre con sesiones computadas, faltas no
 * neutralizadas y % (mismas reglas que la nota de la actividad ASISTENCIA).
 *
 * NO extiende IRepository: arquetipo B (lectura sobre 03-views/).
 */
export class IAsistenciaConsolidadoViewRepository {
  /**
   * Filas del consolidado de un paralelo en gestión (opcionalmente un bimestre).
   * @param {{ paraleloGestionId: number, bimestre?: (number|null) }} _params
   * @returns {Promise<Array<Object>>}
   */
  async listarFilasConsolidado(_params) {
    throw new Error('Method listarFilasConsolidado() must be implemented');
  }
}
