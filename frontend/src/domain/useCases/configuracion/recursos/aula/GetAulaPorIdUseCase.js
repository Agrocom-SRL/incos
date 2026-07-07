import { IAulaRepository } from '@domain/repositories';

export class GetAulaPorIdUseCase {
  /**
   * @param {IAulaRepository} aulaRepository
   */
  constructor(aulaRepository) {
    this.aulaRepository = aulaRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del aula es requerido' };
      }
      return await this.aulaRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el aula',
      };
    }
  }
}
