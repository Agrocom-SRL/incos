import { IEstadoCivilRepository } from '@domain/repositories';

export class CrearEstadoCivilUseCase {
  /**
   * @param {IEstadoCivilRepository} estadoCivilRepository
   */
  constructor(estadoCivilRepository) {
    this.estadoCivilRepository = estadoCivilRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del estado civil son requeridos' };
      }
      const result = await this.estadoCivilRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el estado civil'
            : result.error || 'Error al crear el estado civil';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el estado civil',
      };
    }
  }
}
