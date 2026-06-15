/**
 * Repositorio: tipos de evaluación (catálogo).
 */

export class ITipoEvaluacionRepository {
  /**
   * GET /v1/calificaciones/tipos-evaluacion
   * @param {Object} options
   * @param {Object} options.params - ambito, limite, pagina, busqueda
   */
  async obtenerTodos(options = {}) {
    throw new Error('Method obtenerTodos must be implemented');
  }
}
