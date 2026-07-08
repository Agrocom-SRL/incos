import { IEstadoCivilRepository } from '@domain/repositories';

export class EliminarEstadoCivilUseCase {
  /**
   * @param {IEstadoCivilRepository} estadoCivilRepository
   */
  constructor(estadoCivilRepository) {
    this.estadoCivilRepository = estadoCivilRepository;
  }

  async ejecutar(estadoCivilId) {
    try {
      if (!estadoCivilId) {
        return { success: false, error: 'El ID del estado civil es requerido' };
      }
      const result = await this.estadoCivilRepository.eliminar(estadoCivilId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el estado civil'
            : result.error || 'Error al eliminar el estado civil';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el estado civil',
      };
    }
  }
}
