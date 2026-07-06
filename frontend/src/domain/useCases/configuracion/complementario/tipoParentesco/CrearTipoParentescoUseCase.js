import { ITipoParentescoRepository } from '@domain/repositories';

export class CrearTipoParentescoUseCase {
  /**
   * @param {ITipoParentescoRepository} tipoParentescoRepository
   */
  constructor(tipoParentescoRepository) {
    this.tipoParentescoRepository = tipoParentescoRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de parentesco son requeridos' };
      }
      const result = await this.tipoParentescoRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el tipo de parentesco'
            : result.error || 'Error al crear el tipo de parentesco';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el tipo de parentesco',
      };
    }
  }
}
