import { IDocumentacionRepository } from '@domain/repositories';

export class GetDocumentacionPorIdUseCase {
  /**
   * @param {IDocumentacionRepository} documentacionRepository
   */
  constructor(documentacionRepository) {
    this.documentacionRepository = documentacionRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del tipo de documentación es requerido' };
      }
      return await this.documentacionRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el tipo de documentación',
      };
    }
  }
}
