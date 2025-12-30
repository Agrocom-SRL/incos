/**
 * Hook: useEstudiantesApi
 * 
 * Single Responsibility: Manejar todas las llamadas a la API relacionadas con estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Obtiene la lista de estudiantes usando GetTodosEstudiantesUseCase
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * 
 * Nota: Este hook es específico para llamadas a la API.
 * Para lógica de UI (búsqueda, filtrado, formateo), usar useEstudiantesList
 */

import { useState, useEffect, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { mapEstudiantesList } from '../mappers';

export const useEstudiantesApi = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Función centralizada para cargar estudiantes desde la API
   * Se reutiliza tanto en el efecto inicial como en refetch
   * 
   * @param {Object} options - Opciones para obtener estudiantes
   * @param {Object} options.params - Parámetros de consulta (pagina, limite, busqueda, etc.)
   */
  const fetchStudents = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener el Use Case desde el container
      const obtenerTodosEstudiantesUseCase = useCasesFactory.obtenerTodosEstudiantes();
      
      // Ejecutar el Use Case
      const result = await obtenerTodosEstudiantesUseCase.ejecutar(options);
      
      // Si hay error, manejarlo
      if (!result.success) {
        setError(result.error || 'Error al cargar los estudiantes');
        setEstudiantes([]);
        return;
      }
      
      // Si hay éxito, mapear y actualizar el estado con los estudiantes
      const estudiantesMapeados = mapEstudiantesList(result.data);
      setEstudiantes(estudiantesMapeados);
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      setError(err.message || 'Error al cargar los estudiantes');
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto que se ejecuta solo una vez al montar
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  /**
   * Función para recargar los estudiantes manualmente
   * 
   * @param {Object} options - Opciones para obtener estudiantes (filtros, paginación, etc.)
   */
  const refetch = useCallback(async (options = {}) => {
    await fetchStudents(options);
  }, [fetchStudents]);

  return {
    estudiantes,
    loading,
    error,
    refetch,
  };
};

