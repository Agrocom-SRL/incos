/**
 * Cierra un examen de nivelación (PATCH /nivelaciones/examenes/:id/resultado).
 * Guardado directo, sin confirmación (es el examen, no la decisión
 * administrativa irreversible).
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useRegistrarResultadoNivelacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrarResultado = useCallback(async (levelingId, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory
        .registrarResultadoNivelacion()
        .ejecutar(levelingId, payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo registrar el resultado del examen';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const message = err?.message || 'Error inesperado al registrar el resultado del examen';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { registrarResultado, loading, error };
};

export default useRegistrarResultadoNivelacion;
