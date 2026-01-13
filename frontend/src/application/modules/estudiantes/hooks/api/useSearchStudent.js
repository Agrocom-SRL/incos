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
 * - Transforma la respuesta del backend usando normalizeSearchResponse
 * - Normaliza errores usando helpers genéricos (extractErrorFromResult, normalizeError)
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * - La transformación de datos se hace aquí usando mappers de Application Layer
 * - El manejo de errores se hace usando helpers genéricos reutilizables
 */

import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { normalizeSearchResponse } from '@application-estudiantes/mappers';
import { extractErrorFromResult, normalizeError } from '@application/utils';

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
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener el Use Case desde el container
      const buscarEstudianteUseCase = useCasesFactory.buscarEstudiante();

      // 2. Ejecutar el Use Case (las validaciones están en el Use Case)
      // El Use Case valida searchTerm y options.limit usando validators comunes
      const result = await buscarEstudianteUseCase.ejecutar(searchTerm, options);

      // 3. Si hay error, normalizarlo y actualizar el estado
      if (!result.success) {
        const errorMessage = extractErrorFromResult(result, 'Error al buscar estudiantes');
        setError(errorMessage);
        setStudents([]);
        return;
      }

      // 4. Si hay éxito, transformar y actualizar el estado con los estudiantes
      // El Use Case retorna datos crudos del backend, el hook los transforma usando mapper
      const estudiantes = normalizeSearchResponse(result.data);
      setStudents(estudiantes);
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      // Normalizar el error usando el helper genérico
      const errorMessage = normalizeError(err, 'Error al buscar estudiantes');
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
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

  return {
    students,
    loading,
    error,
    searchStudent,
    refetch,
  };
};
