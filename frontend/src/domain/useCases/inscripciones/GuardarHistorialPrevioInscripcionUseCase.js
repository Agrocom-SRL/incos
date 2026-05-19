/**
 * Use Case: guardar historial previo de una inscripción (PUT dedicado).
 */
export class GuardarHistorialPrevioInscripcionUseCase {
  constructor(inscripcionRepository) {
    this.inscripcionRepository = inscripcionRepository;
  }

  /**
   * @param {string|number} inscripcionId
   * @param {Array} priorHistory
   */
  async ejecutar(inscripcionId, priorHistory) {
    try {
      if (!inscripcionId) {
        return { success: false, error: 'El ID de la inscripción es requerido' };
      }
      if (!Array.isArray(priorHistory) || priorHistory.length === 0) {
        return { success: false, error: 'Debe enviar al menos una nota de historial previo' };
      }

      const result = await this.inscripcionRepository.guardarHistorialPrevio(inscripcionId, {
        prior_history: priorHistory,
      });

      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object'
            ? result.error?.message || 'Error al guardar historial previo'
            : result.error || 'Error al guardar historial previo';
        return { success: false, error: errorMessage };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error?.message || 'Error inesperado al guardar historial previo' };
    }
  }
}
