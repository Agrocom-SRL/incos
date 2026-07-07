import { ITipoEvaluacionAdminRepository } from '@domain/repositories';

export class EliminarTipoEvaluacionUseCase {
  /**
   * @param {ITipoEvaluacionAdminRepository} tipoEvaluacionRepository
   */
  constructor(tipoEvaluacionRepository) {
    this.tipoEvaluacionRepository = tipoEvaluacionRepository;
  }

  async ejecutar(tipoEvaluacionId) {
    try {
      if (!tipoEvaluacionId) {
        return { success: false, error: 'El ID del tipo de evaluación es requerido' };
      }
      const result = await this.tipoEvaluacionRepository.eliminar(tipoEvaluacionId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el tipo de evaluación'
            : result.error || 'Error al eliminar el tipo de evaluación';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el tipo de evaluación',
      };
    }
  }
}
