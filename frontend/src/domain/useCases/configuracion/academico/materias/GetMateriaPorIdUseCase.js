import { IMateriaRepository } from '@domain/repositories';

export class GetMateriaPorIdUseCase {
  /**
   * @param {IMateriaRepository} materiaRepository
   */
  constructor(materiaRepository) {
    this.materiaRepository = materiaRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID de la materia es requerido' };
      }
      return await this.materiaRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener la materia',
      };
    }
  }
}
