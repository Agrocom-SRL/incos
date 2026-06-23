/**
 * Interfaz de Repositorio (SOLO LECTURA): IAsistenciaSesionViewRepository.
 *
 * Lee los "días tomados" de un curso desde `vista_base_asistencia_sesion_dia_tomado`
 * (132), derivada de sesiones_clase (no de contar asistencias). Alimenta el dot del
 * calendario y el denominador del %. También lee el horario regular (vista 128) y los
 * neutros (feriados del calendario + clases no dictadas).
 *
 * NO extiende IRepository: arquetipo B (lectura sobre 03-views/).
 */
export class IAsistenciaSesionViewRepository {
  /**
   * Sesiones tomadas (días tomados) de un curso en un rango.
   * @returns {Promise<Array<Object>>}
   */
  async listarDiasTomados(_asignacionDocenteId, _desde, _hasta) {
    throw new Error('Method listarDiasTomados() must be implemented');
  }

  /**
   * Bloques de horario regular del curso (vista 128) — días-de-semana con clase.
   * @returns {Promise<Array<{ dia: string, hora_inicio: string, hora_fin: string }>>}
   */
  async listarBloquesHorario(_asignacionDocenteId) {
    throw new Error('Method listarBloquesHorario() must be implemented');
  }

  /**
   * Días neutros del calendario (FERIADO) por gestión en un rango.
   * @returns {Promise<Array<{ fecha_inicio: string, fecha_fin: string|null, nombre: string }>>}
   */
  async listarFeriadosCalendario(_gestionId, _desde, _hasta) {
    throw new Error('Method listarFeriadosCalendario() must be implemented');
  }

  /**
   * Días con clase no dictada del curso en un rango (neutros por cancelación).
   * @returns {Promise<Array<{ fecha_clase: string, motivo: string }>>}
   */
  async listarClasesNoDictadas(_asignacionDocenteId, _desde, _hasta) {
    throw new Error('Method listarClasesNoDictadas() must be implemented');
  }
}
