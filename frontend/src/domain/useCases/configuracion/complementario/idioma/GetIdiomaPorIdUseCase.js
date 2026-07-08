import { IIdiomaRepository } from '@domain/repositories';

export class GetIdiomaPorIdUseCase {
  /**
   * @param {IIdiomaRepository} idiomaRepository
   */
  constructor(idiomaRepository) {
    this.idiomaRepository = idiomaRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del idioma es requerido' };
      }
      return await this.idiomaRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el idioma',
      };
    }
  }
}
