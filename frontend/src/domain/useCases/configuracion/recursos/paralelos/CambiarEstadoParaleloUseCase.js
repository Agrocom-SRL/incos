import { IParaleloRepository } from '@domain/repositories';

export class CambiarEstadoParaleloUseCase {
  /**
   * @param {IParaleloRepository} paraleloRepository
   */
  constructor(paraleloRepository) {
    this.paraleloRepository = paraleloRepository;
  }

  /**
   * Activa/desactiva un paralelo maestro (toggle rápido del listado de configuración)
   *
   * @param {string|number} paraleloId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(paraleloId, activo) {
    try {
      if (!paraleloId) {
        return { success: false, error: 'El ID del paralelo es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.paraleloRepository.cambiarEstado(paraleloId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del paralelo'
            : result.error || 'Error al cambiar el estado del paralelo';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del paralelo',
      };
    }
  }
}
