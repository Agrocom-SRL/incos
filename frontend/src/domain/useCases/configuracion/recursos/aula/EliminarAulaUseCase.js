import { IAulaRepository } from '@domain/repositories';

export class EliminarAulaUseCase {
  /**
   * @param {IAulaRepository} aulaRepository
   */
  constructor(aulaRepository) {
    this.aulaRepository = aulaRepository;
  }

  async ejecutar(aulaId) {
    try {
      if (!aulaId) {
        return { success: false, error: 'El ID del aula es requerido' };
      }
      const result = await this.aulaRepository.eliminar(aulaId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el aula'
            : result.error || 'Error al eliminar el aula';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el aula',
      };
    }
  }
}
