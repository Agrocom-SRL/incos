/**
 * Interfaz de Repositorio (solo lectura): ICalificacionCentralizadorRepository
 *
 * Contrato del repositorio que lee el centralizador de calificaciones por
 * paralelo desde la vista base 135 (vista_base_calificacion_centralizador_paralelo_fila),
 * en formato LARGO (una fila por estudiante × oferta_curso).
 *
 * NO extiende IRepository: repositorio de SOLO LECTURA sobre vistas, no CRUD.
 * Devuelve filas de la vista (DTO plano), no entidades de dominio. El pivote a
 * matriz (estudiantes × asignaturas) lo hace el use case.
 */
export class ICalificacionCentralizadorRepository {
  /**
   * Filas del centralizador de un paralelo en gestión (formato largo).
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFilasCentralizadorPorParaleloGestion(paraleloGestionId) {
    throw new Error('Method listarFilasCentralizadorPorParaleloGestion() must be implemented');
  }

  /**
   * Filas del boletín de UN estudiante (mismas columnas de la vista 135, filtrando
   * por estudiante). La vista ya está acotada a la asignación vigente/activa
   * (gestión vigente), por lo que devuelve las asignaturas del estudiante en curso.
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  // eslint-disable-next-line no-unused-vars
  async listarFilasCentralizadorPorEstudiante(estudianteId) {
    throw new Error('Method listarFilasCentralizadorPorEstudiante() must be implemented');
  }
}
