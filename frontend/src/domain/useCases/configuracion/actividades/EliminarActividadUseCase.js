import { IActividadRepository } from '@domain/repositories';

export class EliminarActividadUseCase {
  /**
   * @param {IActividadRepository} actividadRepository
   */
  constructor(actividadRepository) {
    this.actividadRepository = actividadRepository;
  }

  async ejecutar(actividadId) {
    try {
      if (!actividadId) {
        return { success: false, error: 'El ID de la actividad es requerido' };
      }
      const result = await this.actividadRepository.eliminar(actividadId);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al eliminar la actividad'
            : result.error || 'Error al eliminar la actividad';
        return { success: false, error: errorMessage };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al eliminar la actividad',
      };
    }
  }
}
