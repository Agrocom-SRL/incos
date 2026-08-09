/**
 * Programa un examen de nivelación (POST /nivelaciones/examenes). Crea el
 * evento de historial + la fila `nivelaciones` (estado PROGRAMADA).
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useProgramarNivelacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const programar = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.programarNivelacion().ejecutar(payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo programar el examen de nivelación';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const message = err?.message || 'Error inesperado al programar el examen de nivelación';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { programar, loading, error };
};

export default useProgramarNivelacion;
