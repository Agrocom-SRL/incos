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

import { useState, useCallback, useMemo, useRef } from 'react';
import { useCasesFactory } from '@container';
import { mapEstudiantesList } from '@application-estudiantes/mappers';
import { extractErrorFromResult, normalizeError, normalizeFieldToArray } from '@application/utils';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

export const useSearchStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setLoading(prevLoading => prevLoading === true ? prevLoading : true);
    setError(prevError => prevError === null ? prevError : null);

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
        setError(prevError => prevError === errorMessage ? prevError : errorMessage);
        setStudents([]);
        return;
      }

      // 4. Si hay éxito, normalizar estructura y transformar usando mapEstudiantesList
      // Paso 1: Normalizar estructura (objeto → array) usando transformador genérico reutilizable
      const estudiantesNormalizados = normalizeFieldToArray(result.data, 'student');
      // Paso 2: Transformar datos al formato de UI usando mapper específico del módulo
      const estudiantes = mapEstudiantesList(estudiantesNormalizados);
      
      // OPTIMIZACIÓN: Solo actualizar el estado si los datos realmente cambiaron
      // Comparar por longitud y IDs para evitar actualizaciones innecesarias
      setStudents(prevStudents => {
        // Si la longitud es diferente, definitivamente cambió
        if (prevStudents.length !== estudiantes.length) {
          return estudiantes;
        }
        
        // Comparar IDs para verificar si realmente cambió
        const prevIds = prevStudents.map(s => s.id).sort().join(',');
        const newIds = estudiantes.map(s => s.id).sort().join(',');
        
        // Si los IDs son iguales, mantener la referencia anterior (evita re-renders)
        if (prevIds === newIds) {
          return prevStudents;
        }
        
        // Si los IDs cambiaron, actualizar con los nuevos datos
        return estudiantes;
      });
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      // Normalizar el error usando el helper genérico
      const errorMessage = normalizeError(err, 'Error al buscar estudiantes');
      // OPTIMIZACIÓN: Solo actualizar si el error realmente cambió
      setError(prevError => prevError === errorMessage ? prevError : errorMessage);
      setStudents([]);
    } finally {
      // OPTIMIZACIÓN: Solo actualizar si el valor realmente cambió
      setLoading(prevLoading => prevLoading === false ? prevLoading : false);
    }
  }, []);

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

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      students,
      loading,
      error,
      searchStudent,
      refetch,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    // students ya se compara por contenido en setStudents, así que aquí comparamos por referencia
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.searchStudent === current.searchStudent &&
        prev.refetch === current.refetch &&
        prev.students === current.students) {
      
      if (ENABLE_RENDER_LOGS) {
        console.log('✅ [Hook] useSearchStudent - MANTENIENDO referencia');
      }
      return prev;
    }

    if (ENABLE_RENDER_LOGS) {
      console.log('✅ [Hook] useSearchStudent - RECREANDO objeto retornado', {
        studentsCount: students?.length || 0,
        loading,
        error: error ? 'exists' : 'null',
        searchStudentRef: searchStudent ? 'exists' : 'null',
        refetchRef: refetch ? 'exists' : 'null',
      });
    }
    prevResultRef.current = current;
    return current;
  }, [students, loading, error, searchStudent, refetch]);
};
