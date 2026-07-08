import { IIdiomaRepository } from '@domain/repositories';

export class ActualizarIdiomaUseCase {
  /**
   * @param {IIdiomaRepository} idiomaRepository
   */
  constructor(idiomaRepository) {
    this.idiomaRepository = idiomaRepository;
  }

  async ejecutar(idiomaId, datos) {
    try {
      if (!idiomaId) {
        return { success: false, error: 'El ID del idioma es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del idioma son requeridos' };
      }
      const result = await this.idiomaRepository.actualizar(idiomaId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar el idioma'
            : result.error || 'Error al actualizar el idioma';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar el idioma',
      };
    }
  }
}
