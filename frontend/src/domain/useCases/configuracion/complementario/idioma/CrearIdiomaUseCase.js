import { IIdiomaRepository } from '@domain/repositories';

export class CrearIdiomaUseCase {
  /**
   * @param {IIdiomaRepository} idiomaRepository
   */
  constructor(idiomaRepository) {
    this.idiomaRepository = idiomaRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del idioma son requeridos' };
      }
      const result = await this.idiomaRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el idioma'
            : result.error || 'Error al crear el idioma';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el idioma',
      };
    }
  }
}
