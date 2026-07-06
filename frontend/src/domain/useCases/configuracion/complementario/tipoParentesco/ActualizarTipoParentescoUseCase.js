import { ITipoParentescoRepository } from '@domain/repositories';

export class ActualizarTipoParentescoUseCase {
  /**
   * @param {ITipoParentescoRepository} tipoParentescoRepository
   */
  constructor(tipoParentescoRepository) {
    this.tipoParentescoRepository = tipoParentescoRepository;
  }

  async ejecutar(tipoParentescoId, datos) {
    try {
      if (!tipoParentescoId) {
        return { success: false, error: 'El ID del tipo de parentesco es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de parentesco son requeridos' };
      }
      const result = await this.tipoParentescoRepository.actualizar(tipoParentescoId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el tipo de parentesco'
            : result.error || 'Error al actualizar el tipo de parentesco';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el tipo de parentesco',
      };
    }
  }
}
