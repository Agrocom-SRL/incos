import { IDocumentacionRepository } from '@domain/repositories';

export class ActualizarDocumentacionUseCase {
  /**
   * @param {IDocumentacionRepository} documentacionRepository
   */
  constructor(documentacionRepository) {
    this.documentacionRepository = documentacionRepository;
  }

  async ejecutar(documentacionId, datos) {
    try {
      if (!documentacionId) {
        return { success: false, error: 'El ID del tipo de documentación es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de documentación son requeridos' };
      }
      const result = await this.documentacionRepository.actualizar(documentacionId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el tipo de documentación'
            : result.error || 'Error al actualizar el tipo de documentación';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el tipo de documentación',
      };
    }
  }
}
