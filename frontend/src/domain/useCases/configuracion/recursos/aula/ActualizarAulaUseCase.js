import { IAulaRepository } from '@domain/repositories';

export class ActualizarAulaUseCase {
  /**
   * @param {IAulaRepository} aulaRepository
   */
  constructor(aulaRepository) {
    this.aulaRepository = aulaRepository;
  }

  async ejecutar(aulaId, datos) {
    try {
      if (!aulaId) {
        return { success: false, error: 'El ID del aula es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del aula son requeridos' };
      }
      const result = await this.aulaRepository.actualizar(aulaId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el aula'
            : result.error || 'Error al actualizar el aula';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el aula',
      };
    }
  }
}
