import { IEstadoCivilRepository } from '@domain/repositories';

export class CambiarEstadoEstadoCivilUseCase {
  /**
   * @param {IEstadoCivilRepository} estadoCivilRepository
   */
  constructor(estadoCivilRepository) {
    this.estadoCivilRepository = estadoCivilRepository;
  }

  /**
   * Activa/desactiva un estado civil (toggle rápido del listado de configuración)
   *
   * @param {string|number} estadoCivilId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(estadoCivilId, activo) {
    try {
      if (!estadoCivilId) {
        return { success: false, error: 'El ID del estado civil es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.estadoCivilRepository.cambiarEstado(estadoCivilId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del estado civil'
            : result.error || 'Error al cambiar el estado del estado civil';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del estado civil',
      };
    }
  }
}
