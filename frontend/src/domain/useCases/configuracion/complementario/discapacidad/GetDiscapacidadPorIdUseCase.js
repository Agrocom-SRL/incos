import { IDiscapacidadRepository } from '@domain/repositories';

export class GetDiscapacidadPorIdUseCase {
  /**
   * @param {IDiscapacidadRepository} discapacidadRepository
   */
  constructor(discapacidadRepository) {
    this.discapacidadRepository = discapacidadRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID del tipo de discapacidad es requerido' };
      }
      return await this.discapacidadRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener el tipo de discapacidad',
      };
    }
  }
}
