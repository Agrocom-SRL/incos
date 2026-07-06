import { IActividadRepository } from '@domain/repositories';

export class CrearActividadUseCase {
  /**
   * @param {IActividadRepository} actividadRepository
   */
  constructor(actividadRepository) {
    this.actividadRepository = actividadRepository;
  }

  async ejecutar(datos) {
    try {
      if (!datos || typeof datos !== 'object') {
        return { success: false, error: 'Los datos de la actividad son requeridos' };
      }
      const result = await this.actividadRepository.crear(datos);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al crear la actividad'
            : result.error || 'Error al crear la actividad';
        return { success: false, error: errorMessage, validationErrors: result.validationErrors };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al crear la actividad',
      };
    }
  }
}
