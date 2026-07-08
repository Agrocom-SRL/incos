import { ITipoEvaluacionAdminRepository } from '@domain/repositories';

export class CrearTipoEvaluacionUseCase {
  /**
   * @param {ITipoEvaluacionAdminRepository} tipoEvaluacionRepository
   */
  constructor(tipoEvaluacionRepository) {
    this.tipoEvaluacionRepository = tipoEvaluacionRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de evaluación son requeridos' };
      }
      const result = await this.tipoEvaluacionRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el tipo de evaluación'
            : result.error || 'Error al crear el tipo de evaluación';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el tipo de evaluación',
      };
    }
  }
}
