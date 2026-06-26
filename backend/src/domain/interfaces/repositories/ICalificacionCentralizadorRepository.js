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
}
