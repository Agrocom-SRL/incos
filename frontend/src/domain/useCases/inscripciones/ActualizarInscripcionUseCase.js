/**
 * Use Case: Actualizar Inscripción
 *
 * Orquesta la actualización de una inscripción existente (mismo payload que crear:
 * parallel_id para NUEVO, parallel_ids_by_period + materia_ids_by_period para ANTIGUO).
 *
 * @param {IInscripcionRepository} inscripcionRepository
 */
import { IInscripcionRepository } from '@repositories/IInscripcionRepository';

export class ActualizarInscripcionUseCase {
  constructor(inscripcionRepository) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * @param {string|number} inscripcionId - ID de la inscripción a actualizar
   * @param {Object} datosInscripcion - Mismos campos que crear: parallel_id o parallel_ids_by_period + materia_ids_by_period, observations, etc.
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   */
  async ejecutar(inscripcionId, datosInscripcion) {
    try {
      if (!inscripcionId) {
        return { success: false, error: 'El ID de la inscripción es requerido' };
      }
      if (!datosInscripcion || typeof datosInscripcion !== 'object') {
        return { success: false, error: 'Los datos de la inscripción son requeridos' };
      }

      const result = await this.inscripcionRepository.actualizar(inscripcionId, datosInscripcion);

      if (!result.success) {
        let errorMessage = typeof result.error === 'object' ? result.error?.message || 'Error al actualizar inscripción' : result.error;
        let validationErrors = null;
        if (typeof result.error === 'object' && result.error?.details) {
          validationErrors = Array.isArray(result.error.details) ? result.error.details : [result.error.details];
          errorMessage = result.error.message || 'Error de validación';
        }
        return { success: false, error: errorMessage || 'Error al actualizar inscripción', validationErrors };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al actualizar inscripción' };
    }
  }
}
