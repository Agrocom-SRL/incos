import { IDocumentacionRepository } from '@domain/repositories';

export class CrearDocumentacionUseCase {
  /**
   * @param {IDocumentacionRepository} documentacionRepository
   */
  constructor(documentacionRepository) {
    this.documentacionRepository = documentacionRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del tipo de documentación son requeridos' };
      }
      const result = await this.documentacionRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el tipo de documentación'
            : result.error || 'Error al crear el tipo de documentación';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el tipo de documentación',
      };
    }
  }
}
