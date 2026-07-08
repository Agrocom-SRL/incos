import { ITipoEvaluacionAdminRepository } from '@domain/repositories';

export class CambiarEstadoTipoEvaluacionUseCase {
  /**
   * @param {ITipoEvaluacionAdminRepository} tipoEvaluacionAdminRepository
   */
  constructor(tipoEvaluacionAdminRepository) {
    this.tipoEvaluacionAdminRepository = tipoEvaluacionAdminRepository;
  }

  /**
   * Activa/desactiva un tipo de evaluación (toggle rápido del listado de configuración)
   *
   * @param {string|number} tipoEvaluacionId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(tipoEvaluacionId, activo) {
    try {
      if (!tipoEvaluacionId) {
        return { success: false, error: 'El ID del tipo de evaluación es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.tipoEvaluacionAdminRepository.cambiarEstado(
        tipoEvaluacionId,
        activo,
      );
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del tipo de evaluación'
            : result.error || 'Error al cambiar el estado del tipo de evaluación';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del tipo de evaluación',
      };
    }
  }
}
