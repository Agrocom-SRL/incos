/**
 * Hook: useUpdateInscripcion
 * Actualiza una inscripción existente (PUT). Mismo payload que crear:
 * parallel_id (NUEVO) o parallel_ids_by_period + materia_ids_by_period (ANTIGUO).
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

export const useUpdateInscripcion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);
  const optimizedSetValidationErrorsRef = useRef(null);

  if (!optimizedSetLoadingRef.current) {
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
    optimizedSetValidationErrorsRef.current = createOptimizedPrimitiveSetter(setValidationErrors);
  }

  const updateInscripcion = useCallback(async (inscripcionId, formValues) => {
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);
    optimizedSetValidationErrorsRef.current(null);

    try {
      if (!inscripcionId) {
        optimizedSetErrorRef.current('El ID de la inscripción es requerido');
        return { success: false, error: 'El ID de la inscripción es requerido' };
      }
      if (!formValues || typeof formValues !== 'object') {
        optimizedSetErrorRef.current('Los datos de la inscripción son requeridos');
        return { success: false, error: 'Los datos de la inscripción son requeridos' };
      }

      const hasParallelId = formValues.parallel_id != null && formValues.parallel_id !== '' && Number(formValues.parallel_id) >= 1;
      const hasSelectionByPeriod =
        formValues.parallel_ids_by_period &&
        typeof formValues.parallel_ids_by_period === 'object' &&
        formValues.materia_ids_by_period &&
        typeof formValues.materia_ids_by_period === 'object' &&
        Object.keys(formValues.materia_ids_by_period).some(
          (k) => Array.isArray(formValues.materia_ids_by_period[k]) && formValues.materia_ids_by_period[k].length > 0
        );
      if (!hasParallelId && !hasSelectionByPeriod) {
        optimizedSetErrorRef.current('Debe enviar parallel_id o parallel_ids_by_period con materia_ids_by_period (al menos una materia)');
        return { success: false, error: 'Debe enviar parallel_id o parallel_ids_by_period con materia_ids_by_period' };
      }

      const actualizarUseCase = useCasesFactory.actualizarInscripcion();
      const result = await actualizarUseCase.ejecutar(inscripcionId, formValues);

      if (!result.success) {
        const errorMessage = typeof result.error === 'object' && result.error?.message ? result.error.message : result.error || 'Error al actualizar inscripción';
        optimizedSetErrorRef.current(errorMessage);
        if (result.validationErrors) optimizedSetValidationErrorsRef.current(result.validationErrors);
        return {
          ...result,
          errorDetails: result.errorDetails ?? null,
        };
      }

      optimizedSetErrorRef.current(null);
      optimizedSetValidationErrorsRef.current(null);
      return result;
    } catch (err) {
      const errorMessage = err?.message || 'Error inesperado al actualizar inscripción';
      optimizedSetErrorRef.current(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      optimizedSetLoadingRef.current(false);
    }
  }, []);

  return useStableApiResult(
    { updateInscripcion, loading, error, validationErrors },
    false,
    'useUpdateInscripcion'
  );
};
