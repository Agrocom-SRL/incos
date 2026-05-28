import { ICarreraRepository } from '@domain/repositories';

export class ActualizarCarreraUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  async ejecutar(carreraId, datos) {
    try {
      if (!carreraId) {
        return { success: false, error: 'El ID de la carrera es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos de la carrera son requeridos' };
      }
      const result = await this.carreraRepository.actualizar(carreraId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar carrera'
            : result.error || 'Error al actualizar carrera';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar carrera',
      };
    }
  }
}
