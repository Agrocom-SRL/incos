/**
 * Catálogo de tipos de evaluación.
 */

export class GetTiposEvaluacionUseCase {
  /** @param {import('@domain/repositories/ITipoEvaluacionRepository.js').ITipoEvaluacionRepository} tipoEvaluacionRepository */
  constructor(tipoEvaluacionRepository) {
    this.tipoEvaluacionRepository = tipoEvaluacionRepository;
  }

  /**
   * @param {Object} options
   * @param {Object} options.params - ambito, limite, pagina, busqueda
   */
  async ejecutar(options = {}) {
    const { params = { limite: 100 } } = options;
    try {
      const result = await this.tipoEvaluacionRepository.obtenerTodos({ params });
      if (!result.success) return result;
      return {
        success: true,
        data: result.data ?? [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener tipos de evaluación',
      };
    }
  }
}
