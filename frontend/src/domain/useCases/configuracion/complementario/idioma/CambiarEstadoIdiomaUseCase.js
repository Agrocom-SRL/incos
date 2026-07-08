import { IIdiomaRepository } from '@domain/repositories';

export class CambiarEstadoIdiomaUseCase {
  /**
   * @param {IIdiomaRepository} idiomaRepository
   */
  constructor(idiomaRepository) {
    this.idiomaRepository = idiomaRepository;
  }

  /**
   * Activa/desactiva un idioma (toggle rápido del listado de configuración)
   *
   * @param {string|number} idiomaId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(idiomaId, activo) {
    try {
      if (!idiomaId) {
        return { success: false, error: 'El ID del idioma es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.idiomaRepository.cambiarEstado(idiomaId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del idioma'
            : result.error || 'Error al cambiar el estado del idioma';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del idioma',
      };
    }
  }
}
