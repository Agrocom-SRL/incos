import { IDocumentacionRepository } from '@domain/repositories';

export class EliminarDocumentacionUseCase {
  /**
   * @param {IDocumentacionRepository} documentacionRepository
   */
  constructor(documentacionRepository) {
    this.documentacionRepository = documentacionRepository;
  }

  async ejecutar(documentacionId) {
    try {
      if (!documentacionId) {
        return { success: false, error: 'El ID del tipo de documentación es requerido' };
      }
      const result = await this.documentacionRepository.eliminar(documentacionId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar el tipo de documentación'
            : result.error || 'Error al eliminar el tipo de documentación';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar el tipo de documentación',
      };
    }
  }
}
