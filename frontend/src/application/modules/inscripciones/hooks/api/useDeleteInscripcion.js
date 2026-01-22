/**
 * Hook: useDeleteInscripcion
 * 
 * Single Responsibility: Manejar la eliminación de inscripciones vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación de inscripciones usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Proporciona función para eliminar inscripciones usando EliminarInscripcionUseCase
 * - Maneja estados de loading y error
 * - Retorna resultado con success/error
 * 
 * NOTA: La validación completa se hace en el backend.
 * Este hook solo valida que el ID sea válido antes de llamar al Use Case.
 * 
 * Optimización: Usa setters optimizados y useStableApiResult para mantener
 * referencias estables y evitar re-renders innecesarios.
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && false; // Cambiar a true para activar logs

export const useDeleteInscripcion = () => {
  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setters optimizados para evitar actualizaciones innecesarias
  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  // Inicializar los setters optimizados una sola vez
  if (!optimizedSetLoadingRef.current) {
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  /**
   * Elimina una inscripción
   * 
   * @param {string|number} inscripcionId - ID de la inscripción a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const deleteInscripcion = useCallback(async (inscripcionId) => {
    // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      // 1. VALIDACIÓN PREVIA (Application Layer)
      // Validar que el ID sea válido antes de llamar al Use Case
      if (!inscripcionId || (typeof inscripcionId !== 'string' && typeof inscripcionId !== 'number')) {
        const errorMessage = 'ID de la inscripción es requerido';
        optimizedSetErrorRef.current(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // 2. Obtener el Use Case desde el container (inyección de dependencias)
      const eliminarInscripcionUseCase = useCasesFactory.eliminarInscripcion();

      // 3. Ejecutar el Use Case
      // El Use Case orquesta el Repository, que envía la petición DELETE al backend
      // El backend elimina la inscripción, materias inscritas y boletas asociadas
      const result = await eliminarInscripcionUseCase.ejecutar(inscripcionId);

      if (!result.success) {
        // Extraer el mensaje del error si es un objeto
        const errorMessage = typeof result.error === 'object' && result.error?.message
          ? result.error.message
          : result.error || 'Error al eliminar inscripción';
        
        // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
        optimizedSetErrorRef.current(errorMessage);
        
        return result;
      }

      // Si fue exitoso, limpiar errores
      optimizedSetErrorRef.current(null);

      return result;
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      const errorMessage = err?.message || 'Error inesperado al eliminar inscripción';
      // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
      optimizedSetErrorRef.current(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
      optimizedSetLoadingRef.current(false);
    }
  }, []); // Sin dependencias porque los setters están en refs estables

  // Usar helper para mantener referencia estable del resultado
  return useStableApiResult(
    {
      // Función para eliminar inscripción
      deleteInscripcion,

      // Estados
      loading,
      error,
    },
    ENABLE_RENDER_LOGS,
    'useDeleteInscripcion'
  );
};
