import { IAulaRepository } from '@domain/repositories';

export class CambiarEstadoAulaUseCase {
  /**
   * @param {IAulaRepository} aulaRepository
   */
  constructor(aulaRepository) {
    this.aulaRepository = aulaRepository;
  }

  /**
   * Activa/desactiva un aula (toggle rápido del listado de configuración)
   *
   * @param {string|number} aulaId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(aulaId, activo) {
    try {
      if (!aulaId) {
        return { success: false, error: 'El ID del aula es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.aulaRepository.cambiarEstado(aulaId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del aula'
            : result.error || 'Error al cambiar el estado del aula';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del aula',
      };
    }
  }
}
