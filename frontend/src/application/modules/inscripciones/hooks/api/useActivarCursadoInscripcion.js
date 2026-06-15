/**
 * Hook: useActivarCursadoInscripcion
 *
 * Single Responsibility: activar el cursado de una inscripción vía API.
 *
 * Clean Architecture:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 */

import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';

export const useActivarCursadoInscripcion = () => {
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {string|number} inscripcionId
   * @returns {Promise<{success: boolean, data?: Object, error?: string, code?: string}>}
   */
  const activarCursado = useCallback(async (inscripcionId) => {
    setActivating(true);
    setError(null);

    try {
      if (!inscripcionId || (typeof inscripcionId !== 'string' && typeof inscripcionId !== 'number')) {
        const errorMessage = 'ID de la inscripción es requerido';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const useCase = useCasesFactory.activarCursadoInscripcion();
      const result = await useCase.ejecutar(inscripcionId);

      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : result.error || 'Error al activar el cursado';
        setError(errorMessage);
      }

      return result;
    } catch (err) {
      const errorMessage = err?.message || 'Error inesperado al activar el cursado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActivating(false);
    }
  }, []);

  return { activarCursado, activating, error };
};
