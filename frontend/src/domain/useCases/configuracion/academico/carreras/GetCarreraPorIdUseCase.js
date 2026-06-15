import { ICarreraRepository } from '@domain/repositories';

export class GetCarreraPorIdUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID de la carrera es requerido' };
      }
      return await this.carreraRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener la carrera',
      };
    }
  }
}
