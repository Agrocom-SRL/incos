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

import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';

export const useGetStudentById = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Función centralizada para cargar un estudiante desde la API
   * Se reutiliza tanto en getStudentById como en refetch
   * 
   * @param {string|number} id - ID del estudiante
   */
  const fetchStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Validación básica (Application Layer)
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        const errorMessage = 'ID del estudiante es requerido';
        setError(errorMessage);
        setStudent(null);
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
        setError(errorMessage);
        setStudent(null);
        return;
      }

      // 5. Si hay éxito, actualizar el estado con el estudiante
      setStudent(result.data);
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      const errorMessage = typeof err === 'object' && err?.message
        ? err.message
        : err || 'Error al cargar el estudiante';
      setError(errorMessage);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    student,
    loading,
    error,
    getStudentById,
    refetch,
  };
};

