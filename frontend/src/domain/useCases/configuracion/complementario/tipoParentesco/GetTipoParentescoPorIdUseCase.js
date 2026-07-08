import { ITipoParentescoRepository } from '@domain/repositories';

export class GetTipoParentescoPorIdUseCase {
  /**
   * @param {ITipoParentescoRepository} tipoParentescoRepository
   */
  constructor(tipoParentescoRepository) {
    this.tipoParentescoRepository = tipoParentescoRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del tipo de parentesco es requerido' };
      }
      return await this.tipoParentescoRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el tipo de parentesco',
      };
    }
  }
}
