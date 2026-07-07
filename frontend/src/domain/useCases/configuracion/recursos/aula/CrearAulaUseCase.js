import { IAulaRepository } from '@domain/repositories';

export class CrearAulaUseCase {
  /**
   * @param {IAulaRepository} aulaRepository
   */
  constructor(aulaRepository) {
    this.aulaRepository = aulaRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos del aula son requeridos' };
      }
      const result = await this.aulaRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear el aula'
            : result.error || 'Error al crear el aula';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear el aula',
      };
    }
  }
}
