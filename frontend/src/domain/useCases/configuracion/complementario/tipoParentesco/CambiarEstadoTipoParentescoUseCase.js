import { ITipoParentescoRepository } from '@domain/repositories';

export class CambiarEstadoTipoParentescoUseCase {
  /**
   * @param {ITipoParentescoRepository} tipoParentescoRepository
   */
  constructor(tipoParentescoRepository) {
    this.tipoParentescoRepository = tipoParentescoRepository;
  }

  /**
   * Activa/desactiva un tipo de parentesco (toggle rápido del listado de configuración)
   *
   * @param {string|number} tipoParentescoId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(tipoParentescoId, activo) {
    try {
      if (!tipoParentescoId) {
        return { success: false, error: 'El ID del tipo de parentesco es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.tipoParentescoRepository.cambiarEstado(tipoParentescoId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del tipo de parentesco'
            : result.error || 'Error al cambiar el estado del tipo de parentesco';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del tipo de parentesco',
      };
    }
  }
}
