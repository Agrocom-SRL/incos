/**
 * Hook: useGetStudentScholarships
 * 
 * Single Responsibility: Manejar la obtención de becas de un estudiante por ID vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la obtención de becas usando el repositorio
 * 
 * Este hook:
 * - Obtiene las becas de un estudiante usando EstudianteBecaRepository
 * - Maneja estados de loading y error
 * - Proporciona función para refetch
 * - Retorna las becas enriquecidas con información de catálogos
 */

import { useState, useEffect, useCallback } from 'react';
import EstudianteBecaRepository from '@infrastructure/repositories/EstudianteBecaRepository';

/**
 * Hook para obtener las becas de un estudiante
 * 
 * @param {number|string|null} studentId - ID del estudiante
 * @returns {Object} Objeto con becas, loading, error, y función refetch
 */
export const useGetStudentScholarships = (studentId = null) => {
  const [scholarships, setScholarships] = useState([]);
  const [catalogs, setCatalogs] = useState({ scholarships: {}, managements: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Función para obtener las becas del estudiante
   */
  const fetchScholarships = useCallback(async (id) => {
    if (!id) {
      setScholarships([]);
      setCatalogs({ scholarships: {}, managements: {} });
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await EstudianteBecaRepository.obtenerTodos({
        params: { studentId: id },
      });

      if (result.success && result.data) {
        // El endpoint retorna { scholarships: [...], catalogs: {...} }
        const data = result.data;
        const scholarshipsArray = Array.isArray(data.scholarships) ? data.scholarships : [];
        const catalogsData = data.catalogs || { scholarships: {}, managements: {} };
        
        setScholarships(scholarshipsArray);
        setCatalogs(catalogsData);
      } else {
        const errorMsg = result.error || 'Error al obtener las becas del estudiante';
        setError(errorMsg);
        setScholarships([]);
        setCatalogs({ scholarships: {}, managements: {} });
      }
    } catch (err) {
      setError(err.message || 'Error al obtener las becas del estudiante');
      setScholarships([]);
      setCatalogs({ scholarships: {}, managements: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch cuando cambia el studentId
  useEffect(() => {
    if (studentId) {
      fetchScholarships(studentId);
    } else {
      setScholarships([]);
      setCatalogs({ scholarships: {}, managements: {} });
      setError(null);
    }
  }, [studentId, fetchScholarships]);

  // Función refetch expuesta
  const refetch = useCallback(() => {
    if (studentId) {
      return fetchScholarships(studentId);
    }
  }, [studentId, fetchScholarships]);

  return {
    scholarships,
    catalogs,
    loading,
    error,
    refetch,
    getScholarships: fetchScholarships, // Alias para mantener consistencia
  };
};
