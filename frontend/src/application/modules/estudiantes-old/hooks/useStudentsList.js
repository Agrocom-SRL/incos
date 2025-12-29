/**
 * Hook personalizado: useStudentsList
 * 
 * Single Responsibility: Solo maneja la obtención de la lista de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de datos
 * - Usa apiClient para comunicarse con el backend
 * 
 * Este hook:
 * - Obtiene la lista de estudiantes desde el backend
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@api-client';

export const useStudentsList = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Función centralizada para cargar estudiantes
   * Se reutiliza tanto en el efecto inicial como en refetch
   */
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/v1/estudiantes');
      // La respuesta puede venir en response.data.data o response.data
      const data = response.data?.data || response.data || [];
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message ||
        err.message ||
        'Error al cargar los estudiantes';
      setError(errorMessage);
      setEstudiantes([]);
      throw err; // Re-lanzar para que el componente pueda manejar el error
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
   */
  const refetch = useCallback(async () => {
    await fetchStudents();
  }, [fetchStudents]);

  return {
    estudiantes,
    loading,
    error,
    refetch,
  };
};

