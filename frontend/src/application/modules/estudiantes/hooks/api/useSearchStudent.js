/**
 * Hook: useSearchStudent
 * 
 * Single Responsibility: Manejar la búsqueda de estudiantes por término de búsqueda vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la búsqueda de estudiantes usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * - Transforma datos del backend usando mappers antes de pasarlos al provider/componente
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * Application (hook) → Application (mapper) → Transforma datos para UI
 * 
 * Este hook:
 * - Busca estudiantes por término de búsqueda usando BuscarEstudianteUseCase
 * - NO valida parámetros (las validaciones están en el Use Case)
 * - Normaliza la estructura de respuesta usando normalizeFieldToArray (transformador genérico)
 * - Transforma datos usando mapEstudiantesList (mapper específico del módulo)
 * - Normaliza errores usando helpers genéricos (extractErrorFromResult, normalizeError)
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * 
 * Separación de responsabilidades:
 * - Transformador (normalizeFieldToArray): Normaliza estructura (objeto → array) - genérico, reutilizable en cualquier módulo
 * - Mapper (mapEstudiantesList): Transforma datos al formato de UI - específico del módulo de estudiantes
 * - El manejo de errores se hace usando helpers genéricos reutilizables
 */

import { useState, useCallback, useRef } from 'react';
import { useCasesFactory } from '@container';
import { mapEstudiantesList } from '@application-estudiantes/mappers';
import { extractErrorFromResult, normalizeError, normalizeFieldToArray, createOptimizedArraySetter, createOptimizedPrimitiveSetter, useStableApiResult } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

export const useSearchStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setters optimizados para evitar actualizaciones innecesarias
  // Usar useRef para mantener referencias estables (setState de React ya es estable)
  const optimizedSetStudentsRef = useRef(null);
  const optimizedSetLoadingRef = useRef(null);
  const optimizedSetErrorRef = useRef(null);

  // Inicializar los setters optimizados una sola vez
  if (!optimizedSetStudentsRef.current) {
    optimizedSetStudentsRef.current = createOptimizedArraySetter(setStudents);
    optimizedSetLoadingRef.current = createOptimizedPrimitiveSetter(setLoading);
    optimizedSetErrorRef.current = createOptimizedPrimitiveSetter(setError);
  }

  /**
   * Función centralizada para buscar estudiantes desde la API
   * Se reutiliza tanto en searchStudent como en refetch
   * 
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones opcionales
   * @param {number} options.limit - Límite de resultados (opcional, default: 50)
   */
  const fetchStudents = useCallback(async (searchTerm, options = {}) => {
    // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
    optimizedSetLoadingRef.current(true);
    optimizedSetErrorRef.current(null);

    try {
      // 1. Obtener el Use Case desde el container
      const buscarEstudianteUseCase = useCasesFactory.buscarEstudiante();

      // 2. Ejecutar el Use Case (las validaciones están en el Use Case)
      // El Use Case valida searchTerm y options.limit usando validators comunes
      const result = await buscarEstudianteUseCase.ejecutar(searchTerm, options);

      // 3. Si hay error, normalizarlo y actualizar el estado
      if (!result.success) {
        const errorMessage = extractErrorFromResult(result, 'Error al buscar estudiantes');
        // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
        optimizedSetErrorRef.current(errorMessage);
        optimizedSetStudentsRef.current([]);
        return;
      }

      // 4. Si hay éxito, normalizar estructura y transformar usando mapEstudiantesList
      // Paso 1: Normalizar estructura (objeto → array) usando transformador genérico reutilizable
      const estudiantesNormalizados = normalizeFieldToArray(result.data, 'student');
      // Paso 2: Transformar datos al formato de UI usando mapper específico del módulo
      const estudiantes = mapEstudiantesList(estudiantesNormalizados);
      
      // OPTIMIZACIÓN: Solo actualizar el estado si los datos realmente cambiaron
      // El helper createOptimizedArraySetter compara por longitud y IDs automáticamente
      optimizedSetStudentsRef.current(estudiantes);
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      // Normalizar el error usando el helper genérico
      const errorMessage = normalizeError(err, 'Error al buscar estudiantes');
      // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
      optimizedSetErrorRef.current(errorMessage);
      optimizedSetStudentsRef.current([]);
    } finally {
      // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
      optimizedSetLoadingRef.current(false);
    }
  }, []); // Sin dependencias porque los setters están en refs estables

  /**
   * Busca estudiantes por término de búsqueda
   * 
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones opcionales
   * @param {number} options.limit - Límite de resultados (opcional, default: 50)
   */
  const searchStudent = useCallback(async (searchTerm, options = {}) => {
    await fetchStudents(searchTerm, options);
  }, [fetchStudents]);

  /**
   * Función para recargar la búsqueda manualmente
   * 
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones opcionales
   * @param {number} options.limit - Límite de resultados (opcional, default: 50)
   */
  const refetch = useCallback(async (searchTerm, options = {}) => {
    await fetchStudents(searchTerm, options);
  }, [fetchStudents]);

  // Usar helper para mantener referencia estable del resultado
  return useStableApiResult(
    {
      students,
      loading,
      error,
      searchStudent,
      refetch,
    },
    ENABLE_RENDER_LOGS,
    'useSearchStudent'
  );
};
