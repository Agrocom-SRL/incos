/**
 * Hook personalizado: useStudentFormData
 * 
 * Single Responsibility: Solo obtiene datos iniciales para mostrar la página
 * Propósito: Obtener datos necesarios para renderizar el formulario (estadísticas, opciones, etc.)
 * 
 * Este hook se usa cuando la página se carga (GET requests)
 */

import { useState, useEffect } from 'react';

export const useStudentFormData = () => {
  const [stats, setStats] = useState({
    todayStudents: 0,
    monthStudents: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Opciones estáticas para los select (podrían venir del backend en el futuro)
  const expediciones = ['SC', 'LP', 'CB', 'TJ', 'BN', 'PD', 'OR', 'PT', 'CH'];
  const generos = ['MASCULINO', 'FEMENINO', 'OTRO'];
  const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Implementar llamadas a la API para obtener estadísticas reales
        // Por ahora usamos valores de ejemplo
        // En el futuro: const response = await apiClient.get('/v1/estudiantes/stats');
        
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });
      } catch (err) {
        const errorMessage = err.message || 'Error al cargar datos del formulario';
        setError(errorMessage);
        console.error('Error al cargar datos del formulario:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  return {
    // Datos para mostrar
    stats,
    expediciones,
    generos,
    tiposSangre,
    
    // Estados
    loading,
    error,
    
    // Función para refrescar datos
    refetch: async () => {
      setLoading(true);
      try {
        // TODO: Llamar a la API
        setStats({
          todayStudents: 5,
          monthStudents: 127,
          totalStudents: 1543,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
  };
};

