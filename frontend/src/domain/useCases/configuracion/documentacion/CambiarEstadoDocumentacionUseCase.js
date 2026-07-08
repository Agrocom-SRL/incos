import { IDocumentacionRepository } from '@domain/repositories';

export class CambiarEstadoDocumentacionUseCase {
  /**
   * @param {IDocumentacionRepository} documentacionRepository
   */
  constructor(documentacionRepository) {
    this.documentacionRepository = documentacionRepository;
  }

  /**
   * Activa/desactiva un documento (toggle rápido del listado de configuración)
   *
   * @param {string|number} documentacionId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(documentacionId, activo) {
    try {
      if (!documentacionId) {
        return { success: false, error: 'El ID del documento es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.documentacionRepository.cambiarEstado(documentacionId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado del documento'
            : result.error || 'Error al cambiar el estado del documento';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado del documento',
      };
    }
  }
}
