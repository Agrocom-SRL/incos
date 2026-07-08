import { IDiscapacidadRepository } from '@domain/repositories';

export class EliminarDiscapacidadUseCase {
  /**
   * @param {IDiscapacidadRepository} discapacidadRepository
   */
  constructor(discapacidadRepository) {
    this.discapacidadRepository = discapacidadRepository;
  }

  async ejecutar(discapacidadId) {
    try {
      if (!discapacidadId) {
        return { success: false, error: 'El ID del tipo de discapacidad es requerido' };
      }
      const result = await this.discapacidadRepository.eliminar(discapacidadId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el tipo de discapacidad'
            : result.error || 'Error al eliminar el tipo de discapacidad';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el tipo de discapacidad',
      };
    }
  }
}
