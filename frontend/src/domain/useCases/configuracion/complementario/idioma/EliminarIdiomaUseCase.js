import { IIdiomaRepository } from '@domain/repositories';

export class EliminarIdiomaUseCase {
  /**
   * @param {IIdiomaRepository} idiomaRepository
   */
  constructor(idiomaRepository) {
    this.idiomaRepository = idiomaRepository;
  }

  async ejecutar(idiomaId) {
    try {
      if (!idiomaId) {
        return { success: false, error: 'El ID del idioma es requerido' };
      }
      const result = await this.idiomaRepository.eliminar(idiomaId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el idioma'
            : result.error || 'Error al eliminar el idioma';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el idioma',
      };
    }
  }
}
