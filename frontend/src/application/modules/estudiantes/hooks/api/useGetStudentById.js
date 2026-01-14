/**
 * Hook: useGetStudentById
 * 
 * Single Responsibility: Manejar la obtención de un estudiante por ID vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de estudiantes usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene un estudiante por ID usando ObtenerEstudiantePorIdUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (formateo, transformación), usar componentes o mappers
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { createOptimizedObjectSetter, createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

export const useGetStudentById = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setters optimizados para evitar actualizaciones innecesarias
  // Usar useRef para mantener referencias estables (setState de React ya es estable)
  const optimizedSetStudentRef = useRef(null);
  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  // Inicializar los setters optimizados una sola vez
  if (!optimizedSetStudentRef.current) {
    optimizedSetStudentRef.current = createOptimizedObjectSetter(setStudent);
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  /**
   * Función centralizada para cargar un estudiante desde la API
   * Se reutiliza tanto en getStudentById como en refetch
   * 
   * @param {string|number} id - ID del estudiante
   */
  const fetchStudent = useCallback(async (id) => {
    // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      // 1. Validación básica (Application Layer)
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        const errorMessage = 'ID del estudiante es requerido';
        // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
        optimizedSetErrorRef.current(errorMessage);
        optimizedSetStudentRef.current(null);
        return;
      }

      // 2. Obtener el Use Case desde el container
      const obtenerEstudiantePorIdUseCase = useCasesFactory.obtenerEstudiantePorId();

      // 3. Ejecutar el Use Case
      const result = await obtenerEstudiantePorIdUseCase.ejecutar(id);

      // 4. Si hay error, manejarlo
      if (!result.success) {
        // Extraer el mensaje del error si es un objeto
        const errorMessage = typeof result.error === 'object' && result.error?.message
          ? result.error.message
          : result.error || 'Error al cargar el estudiante';
        // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
        optimizedSetErrorRef.current(errorMessage);
        optimizedSetStudentRef.current(null);
        return;
      }

      // 5. Si hay éxito, actualizar el estado con el estudiante
      // OPTIMIZACIÓN: Solo actualizar si la referencia realmente cambió
      optimizedSetStudentRef.current(result.data);
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      const errorMessage = typeof err === 'object' && err?.message
        ? err.message
        : err || 'Error al cargar el estudiante';
      // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
      optimizedSetErrorRef.current(errorMessage);
      optimizedSetStudentRef.current(null);
    } finally {
      // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
      optimizedSetLoadingRef.current(false);
    }
  }, []); // Sin dependencias porque los setters están en refs estables

  /**
   * Obtiene un estudiante por ID
   * 
   * @param {string|number} id - ID del estudiante
   */
  const getStudentById = useCallback(async (id) => {
    await fetchStudent(id);
  }, [fetchStudent]);

  /**
   * Función para recargar el estudiante manualmente
   * 
   * @param {string|number} id - ID del estudiante
   */
  const refetch = useCallback(async (id) => {
    await fetchStudent(id);
  }, [fetchStudent]);

  // Usar helper para mantener referencia estable del resultado
  return useStableApiResult(
    {
      student,
      loading,
      error,
      getStudentById,
      refetch,
    },
    ENABLE_RENDER_LOGS,
    'useGetStudentById'
  );
};

