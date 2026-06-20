/**
 * Interfaz de Repositorio (SOLO LECTURA): IAsistenciaPlanillaViewRepository.
 *
 * Lee las celdas de la planilla desde `vista_base_asistencia_planilla_celda` (133):
 * roster × sesiones tomadas, con la marca registrada (asistencias) y la licencia
 * APROBADA cruzada. El mapper deriva P/R/F/L y la neutralidad.
 *
 * NO extiende IRepository: arquetipo B (lectura sobre 03-views/).
 */
export class IAsistenciaPlanillaViewRepository {
  /**
   * Celdas de la planilla de un curso en un rango de fechas.
   * @returns {Promise<Array<Object>>}
   */
  async listarCeldasPlanilla(_asignacionDocenteId, _desde, _hasta) {
    throw new Error('Method listarCeldasPlanilla() must be implemented');
  }

  /**
   * Roster del curso (estudiantes matriculados), independiente de las sesiones.
   * @returns {Promise<Array<Object>>}
   */
  async listarRoster(_asignacionDocenteId) {
    throw new Error('Method listarRoster() must be implemented');
  }
}
