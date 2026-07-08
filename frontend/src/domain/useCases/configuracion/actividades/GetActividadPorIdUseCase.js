import { IActividadRepository } from '@domain/repositories';

export class GetActividadPorIdUseCase {
  /**
   * @param {IActividadRepository} actividadRepository
   */
  constructor(actividadRepository) {
    this.actividadRepository = actividadRepository;
  }

  async ejecutar(id) {
    try {
      if (!id) {
        return { success: false, error: 'El ID de la actividad es requerido' };
      }
      return await this.actividadRepository.obtenerPorId(id);
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al obtener la actividad',
      };
    }
  }
}
