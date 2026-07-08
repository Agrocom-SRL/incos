import { IActividadRepository } from '@domain/repositories';

export class CambiarEstadoActividadUseCase {
  /**
   * @param {IActividadRepository} actividadRepository
   */
  constructor(actividadRepository) {
    this.actividadRepository = actividadRepository;
  }

  /**
   * Activa/desactiva una actividad (toggle rápido del listado de configuración)
   *
   * @param {string|number} actividadId
   * @param {boolean} activo - Nuevo estado (true = activo)
   */
  async ejecutar(actividadId, activo) {
    try {
      if (!actividadId) {
        return { success: false, error: 'El ID de la actividad es requerido' };
      }
      if (typeof activo !== 'boolean') {
        return { success: false, error: 'El nuevo estado (activo) es requerido' };
      }
      const result = await this.actividadRepository.cambiarEstado(actividadId, activo);
      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al cambiar el estado de la actividad'
            : result.error || 'Error al cambiar el estado de la actividad';
        return { success: false, error: errorMessage };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al cambiar el estado de la actividad',
      };
    }
  }
}
