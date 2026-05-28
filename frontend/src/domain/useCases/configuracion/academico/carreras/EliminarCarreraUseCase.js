import { ICarreraRepository } from '@domain/repositories';

export class EliminarCarreraUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  async ejecutar(carreraId) {
    try {
      if (!carreraId) {
        return { success: false, error: 'El ID de la carrera es requerido' };
      }
      const result = await this.carreraRepository.eliminar(carreraId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar carrera'
            : result.error || 'Error al eliminar carrera';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar carrera',
      };
    }
  }
}
