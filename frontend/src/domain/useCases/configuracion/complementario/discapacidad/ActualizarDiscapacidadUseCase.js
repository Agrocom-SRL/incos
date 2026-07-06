import { IDiscapacidadRepository } from '@domain/repositories';

export class ActualizarDiscapacidadUseCase {
  /**
   * @param {IDiscapacidadRepository} discapacidadRepository
   */
  constructor(discapacidadRepository) {
    this.discapacidadRepository = discapacidadRepository;
  }

  async ejecutar(discapacidadId, datos) {
    try {
      if (!discapacidadId) {
        return { success: false, error: 'El ID del tipo de discapacidad es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de discapacidad son requeridos' };
      }
      const result = await this.discapacidadRepository.actualizar(discapacidadId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el tipo de discapacidad'
            : result.error || 'Error al actualizar el tipo de discapacidad';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el tipo de discapacidad',
      };
    }
  }
}
