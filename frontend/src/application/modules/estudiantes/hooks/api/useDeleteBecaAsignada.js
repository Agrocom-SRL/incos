/**
 * Hook: useDeleteBecaAsignada
 *
 * Single Responsibility: Manejar la eliminación de becas asignadas a estudiantes vía API
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 *
 * Flujo: Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 *
 * Este hook:
 * - Proporciona función para eliminar becas asignadas usando EliminarBecaAsignadaUseCase
 * - Maneja estados de loading y error
 * - Retorna resultado con success/error
 *
 * NOTA: La validación (p. ej. beca vinculada a pago vigente) se hace en el backend.
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

const ENABLE_RENDER_LOGS = import.meta.env.DEV && false;

export const useDeleteBecaAsignada = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  if (!optimizedSetLoadingRef.current) {
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  const deleteBecaAsignada = useCallback(async (becaId) => {
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      if (!becaId || (typeof becaId !== 'string' && typeof becaId !== 'number')) {
        const errorMessage = 'ID de la beca asignada es requerido';
        optimizedSetErrorRef.current(errorMessage);
        return { success: false, error: errorMessage };
      }

      const eliminarBecaAsignadaUseCase = useCasesFactory.eliminarBecaAsignada();
      const result = await eliminarBecaAsignadaUseCase.ejecutar(becaId);

      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : result.error || 'Error al eliminar beca asignada';
        optimizedSetErrorRef.current(errorMessage);
        return result;
      }

      optimizedSetErrorRef.current(null);
      return result;
    } catch (err) {
      const errorMessage = err?.message || 'Error inesperado al eliminar beca asignada';
      optimizedSetErrorRef.current(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      optimizedSetLoadingRef.current(false);
    }
  }, []);

  return useStableApiResult(
    { deleteBecaAsignada, loading, error },
    ENABLE_RENDER_LOGS,
    'useDeleteBecaAsignada'
  );
};
