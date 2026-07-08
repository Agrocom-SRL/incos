import { IDiscapacidadRepository } from '@domain/repositories';

export class CambiarEstadoDiscapacidadUseCase {
  /**
   * @param {IDiscapacidadRepository} discapacidadRepository
   */
  constructor(discapacidadRepository) {
    this.discapacidadRepository = discapacidadRepository;
  }

  /**
   * Activa/desactiva un tipo de discapacidad (toggle rápido del listado de configuración)
   *
   * @param {string|number} discapacidadId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(discapacidadId, activo) {
    try {
      if (!discapacidadId) {
        return { success: false, error: 'El ID del tipo de discapacidad es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.discapacidadRepository.cambiarEstado(discapacidadId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del tipo de discapacidad'
            : result.error || 'Error al cambiar el estado del tipo de discapacidad';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del tipo de discapacidad',
      };
    }
  }
}
