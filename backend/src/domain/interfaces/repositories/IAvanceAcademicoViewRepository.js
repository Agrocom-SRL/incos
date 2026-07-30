/**
 * Interfaz de Repositorio (SOLO LECTURA): IAvanceAcademicoViewRepository.
 *
 * Lee el avance académico por estudiante × plan desde
 * `vista_avance_academico_estudiante` (171): materias aprobadas/convalidadas
 * (numerador, universo del transcript 141) vs total de asignaturas del plan
 * (denominador). El % se deriva en el use case.
 *
 * NO extiende IRepository: arquetipo B (lectura sobre 03-views/).
 */
export class IAvanceAcademicoViewRepository {
  /**
   * Filas de avance, opcionalmente filtradas por carrera y/o estudiante
   * (el filtro por estudiante lo usa el alcance self del portal — anti-IDOR).
   * @param {{ carreraId?: (number|null), estudianteId?: (number|null) }} _params
   * @returns {Promise<Array<Object>>}
   */
  async listarAvance(_params) {
    throw new Error('Method listarAvance() must be implemented');
  }
}
