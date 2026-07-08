import { IDiscapacidadRepository } from '@domain/repositories';

export class CrearDiscapacidadUseCase {
  /**
   * @param {IDiscapacidadRepository} discapacidadRepository
   */
  constructor(discapacidadRepository) {
    this.discapacidadRepository = discapacidadRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de discapacidad son requeridos' };
      }
      const result = await this.discapacidadRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el tipo de discapacidad'
            : result.error || 'Error al crear el tipo de discapacidad';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el tipo de discapacidad',
      };
    }
  }
}
