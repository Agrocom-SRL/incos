import { ITipoEvaluacionAdminRepository } from '@domain/repositories';

export class ActualizarTipoEvaluacionUseCase {
  /**
   * @param {ITipoEvaluacionAdminRepository} tipoEvaluacionRepository
   */
  constructor(tipoEvaluacionRepository) {
    this.tipoEvaluacionRepository = tipoEvaluacionRepository;
  }

  async ejecutar(tipoEvaluacionId, datos) {
    try {
      if (!tipoEvaluacionId) {
        return { success: false, error: 'El ID del tipo de evaluación es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de evaluación son requeridos' };
      }
      const result = await this.tipoEvaluacionRepository.actualizar(tipoEvaluacionId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el tipo de evaluación'
            : result.error || 'Error al actualizar el tipo de evaluación';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el tipo de evaluación',
      };
    }
  }
}
