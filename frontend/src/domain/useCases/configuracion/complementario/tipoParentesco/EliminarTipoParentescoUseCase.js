import { ITipoParentescoRepository } from '@domain/repositories';

export class EliminarTipoParentescoUseCase {
  /**
   * @param {ITipoParentescoRepository} tipoParentescoRepository
   */
  constructor(tipoParentescoRepository) {
    this.tipoParentescoRepository = tipoParentescoRepository;
  }

  async ejecutar(tipoParentescoId) {
    try {
      if (!tipoParentescoId) {
        return { success: false, error: 'El ID del tipo de parentesco es requerido' };
      }
      const result = await this.tipoParentescoRepository.eliminar(tipoParentescoId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el tipo de parentesco'
            : result.error || 'Error al eliminar el tipo de parentesco';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el tipo de parentesco',
      };
    }
  }
}
