import { IEstadoCivilRepository } from '@domain/repositories';

export class GetEstadoCivilPorIdUseCase {
  /**
   * @param {IEstadoCivilRepository} estadoCivilRepository
   */
  constructor(estadoCivilRepository) {
    this.estadoCivilRepository = estadoCivilRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del estado civil es requerido' };
      }
      return await this.estadoCivilRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el estado civil',
      };
    }
  }
}
