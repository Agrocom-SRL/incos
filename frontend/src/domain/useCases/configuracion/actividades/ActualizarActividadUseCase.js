import { IActividadRepository } from '@domain/repositories';

export class ActualizarActividadUseCase {
  /**
   * @param {IActividadRepository} actividadRepository
   */
  constructor(actividadRepository) {
    this.actividadRepository = actividadRepository;
  }

  async ejecutar(actividadId, datos) {
    try {
      if (!actividadId) {
        return { success: false, error: 'El ID de la actividad es requerido' };
      }
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos de la actividad son requeridos' };
      }
      const result = await this.actividadRepository.actualizar(actividadId, datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al actualizar la actividad'
            : result.error || 'Error al actualizar la actividad';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al actualizar la actividad',
      };
    }
  }
}
