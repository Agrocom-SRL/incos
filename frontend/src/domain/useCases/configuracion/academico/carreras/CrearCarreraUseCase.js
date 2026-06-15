import { ICarreraRepository } from '@domain/repositories';

export class CrearCarreraUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos de la carrera son requeridos' };
      }
      const result = await this.carreraRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear carrera'
            : result.error || 'Error al crear carrera';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear carrera',
      };
    }
  }
}
