import { IEstadoCivilRepository } from '@domain/repositories';

export class ActualizarEstadoCivilUseCase {
  /**
   * @param {IEstadoCivilRepository} estadoCivilRepository
   */
  constructor(estadoCivilRepository) {
    this.estadoCivilRepository = estadoCivilRepository;
  }

  async ejecutar(estadoCivilId, datos) {
    try {
      if (!estadoCivilId) {
        return { success: false, error: 'El ID del estado civil es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del estado civil son requeridos' };
      }
      const result = await this.estadoCivilRepository.actualizar(estadoCivilId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el estado civil'
            : result.error || 'Error al actualizar el estado civil';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el estado civil',
      };
    }
  }
}
