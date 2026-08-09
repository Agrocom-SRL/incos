/**
 * Registra un evento genérico de historial_matricula (POST /nivelaciones/eventos).
 * Mutación bajo demanda: no mantiene datos en memoria.
 */

import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useRegistrarEventoHistorial = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrarEvento = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.registrarEventoHistorialNivelacion().ejecutar(payload);
      if (!result?.success) {
        const message = result?.error || 'No se pudo registrar el evento';
        setError(message);
        return { success: false, error: message };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const message = err?.message || 'Error inesperado al registrar el evento';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { registrarEvento, loading, error };
};

export default useRegistrarEventoHistorial;
