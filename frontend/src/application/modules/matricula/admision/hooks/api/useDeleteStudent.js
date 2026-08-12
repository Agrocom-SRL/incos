/**
 * Hook: useDeleteStudent
 *
 * Single Responsibility: Manejar la eliminación de estudiantes vía API
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 *
 * Flujo: Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 *
 * Este hook:
 * - Proporciona función para eliminar estudiantes usando EliminarEstudianteUseCase
 * - Maneja estados de loading y error
 * - Retorna resultado con success/error
 *
 * NOTA: La validación (p. ej. estudiante con inscripciones activas) se hace en el backend.
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

const ENABLE_RENDER_LOGS = import.meta.env.DEV && false;

export const useDeleteStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  if (!optimizedSetLoadingRef.current) {
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  const deleteStudent = useCallback(async (studentId) => {
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      if (!studentId || (typeof studentId !== 'string' && typeof studentId !== 'number')) {
        const errorMessage = 'ID del estudiante es requerido';
        optimizedSetErrorRef.current(errorMessage);
        return { success: false, error: errorMessage };
      }

      const eliminarEstudianteUseCase = useCasesFactory.eliminarEstudiante();
      const result = await eliminarEstudianteUseCase.ejecutar(studentId);

      if (!result.success) {
        const errorMessage =
          typeof result.error === 'object' && result.error?.message
            ? result.error.message
            : result.error || 'Error al eliminar estudiante';
        optimizedSetErrorRef.current(errorMessage);
        return result;
      }

      optimizedSetErrorRef.current(null);
      return result;
    } catch (err) {
      const errorMessage = err?.message || 'Error inesperado al eliminar estudiante';
      optimizedSetErrorRef.current(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      optimizedSetLoadingRef.current(false);
    }
  }, []);

  return useStableApiResult(
    { deleteStudent, loading, error },
    ENABLE_RENDER_LOGS,
    'useDeleteStudent'
  );
};
