/**
 * Hook: useCreateInscripcion
 * 
 * Single Responsibility: Manejar la creación de inscripciones vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la creación de inscripciones usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * - Valida datos ANTES de llamar al Use Case (separación de responsabilidades)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Proporciona función para crear inscripciones usando CrearInscripcionUseCase
 * - Maneja estados de loading y error
 * - Retorna resultado con success/error
 * 
 * NOTA: La validación completa se hace en el backend (validator).
 * Este hook solo valida campos requeridos básicos antes de llamar al Use Case.
 * 
 * Optimización: Usa setters optimizados y useStableApiResult para mantener
 * referencias estables y evitar re-renders innecesarios.
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && false; // Cambiar a true para activar logs

export const useCreateInscripcion = () => {
  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  // Setters optimizados para evitar actualizaciones innecesarias
  // Usar useRef para mantener referencias estables (setState de React ya es estable)
  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);
  const optimizedSetValidationErrorsRef = useRef(null);

  // Inicializar los setters optimizados una sola vez
  if (!optimizedSetLoadingRef.current) {
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
    optimizedSetValidationErrorsRef.current = createOptimizedPrimitiveSetter(setValidationErrors);
  }

  /**
   * Crea una nueva inscripción
   * 
   * @param {Object} formValues - Valores del formulario
   * @param {number} formValues.student_id - ID del estudiante (requerido)
   * @param {number} formValues.parallel_id - ID del paralelo (requerido)
   * @param {string} [formValues.enrollment_type] - Tipo de inscripción (NUEVO, ANTIGUO, TRASPASO, TRANSITABILIDAD, etc.) - opcional
   * @param {string} [formValues.observations] - Observaciones (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   */
  const createInscripcion = useCallback(async (formValues) => {
    // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);
    optimizedSetValidationErrorsRef.current(null);

    try {
      // 1. VALIDACIÓN PREVIA (Application Layer)
      // Validar campos requeridos antes de llamar al Use Case para evitar llamadas innecesarias
      if (!formValues || typeof formValues !== 'object') {
        const errorMessage = 'Los datos de la inscripción son requeridos';
        optimizedSetErrorRef.current(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      if (!formValues.student_id) {
        const errorMessage = 'El ID del estudiante es requerido';
        optimizedSetErrorRef.current(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
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
        const errorMessage = 'Debe enviar parallel_id o parallel_ids_by_period con materia_ids_by_period (al menos una materia)';
        optimizedSetErrorRef.current(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // 2. Obtener el Use Case desde el container (inyección de dependencias)
      const crearInscripcionUseCase = useCasesFactory.crearInscripcion();

      // 3. Ejecutar el Use Case
      // El Use Case orquesta el Repository, que envía los datos al backend
      // El backend tiene el validator y el Use Case que crea datos académicos si no existen,
      // obtiene materias del paralelo y crea los registros en las tablas correspondientes
      const result = await crearInscripcionUseCase.ejecutar(formValues);

      if (!result.success) {
        // Extraer el mensaje del error si es un objeto
        const errorMessage = typeof result.error === 'object' && result.error?.message
          ? result.error.message
          : result.error || 'Error al crear inscripción';
        
        // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
        optimizedSetErrorRef.current(errorMessage);
        
        // Si el backend retorna errores de validación, guardarlos
        if (result.validationErrors) {
          optimizedSetValidationErrorsRef.current(result.validationErrors);
        }
        
        return result;
      }

      // Si fue exitoso, limpiar errores
      optimizedSetErrorRef.current(null);
      optimizedSetValidationErrorsRef.current(null);

      return result;
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      const errorMessage = err?.message || 'Error inesperado al crear inscripción';
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
      // Función para crear inscripción
      createInscripcion,

      // Estados
      loading,
      error,
      validationErrors,
    },
    ENABLE_RENDER_LOGS,
    'useCreateInscripcion'
  );
};
