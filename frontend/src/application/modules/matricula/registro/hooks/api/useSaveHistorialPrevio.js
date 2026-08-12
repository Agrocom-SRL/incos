/**
 * Hook: guardar historial previo (PUT /inscripciones/:id/historial-previo).
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

export const useSaveHistorialPrevio = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  if (!optimizedSetLoadingRef.current) {
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  const saveHistorialPrevio = useCallback(async (inscripcionId, priorHistory) => {
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      const useCase = useCasesFactory.guardarHistorialPrevioInscripcion();
      const result = await useCase.ejecutar(inscripcionId, priorHistory);
      if (!result.success) {
        optimizedSetErrorRef.current(result.error || 'Error al guardar historial previo');
      }
      return result;
    } catch (err) {
      const errorMessage = err?.message || 'Error inesperado al guardar historial previo';
      optimizedSetErrorRef.current(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      optimizedSetLoadingRef.current(false);
    }
  }, []);

  return useStableApiResult({ saveHistorialPrevio, loading, error }, false, 'useSaveHistorialPrevio');
};
