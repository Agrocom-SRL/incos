import { IMateriaRepository } from '@domain/repositories';

export class EliminarMateriaUseCase {
  /**
   * @param {IMateriaRepository} materiaRepository
   */
  constructor(materiaRepository) {
    this.materiaRepository = materiaRepository;
  }

  async ejecutar(materiaId) {
    try {
      if (!materiaId) {
        return { success: false, error: 'El ID de la materia es requerido' };
      }
      const result = await this.materiaRepository.eliminar(materiaId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar materia'
            : result.error || 'Error al eliminar materia';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar materia',
      };
    }
  }
}
