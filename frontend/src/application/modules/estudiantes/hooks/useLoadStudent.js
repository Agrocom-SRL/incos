// application/modules/estudiantes/hooks/useLoadStudent.js
/**
 * Hook para cargar datos de un estudiante existente
 * 
 * Responsabilidad: Cargar datos del estudiante, documentos y datos académicos
 * desde el backend y formatearlos para el formulario
 */

import { useState, useEffect } from 'react';
import { App } from 'antd';
import apiClient from '@infrastructure/api/client.js';
import { formatStudentDataForForm, resolveAllGeographicCascades } from '@estudiantes/helpers';

/**
 * Hook para cargar datos de un estudiante existente
 * @param {string|number|null} estudianteId - ID del estudiante a cargar
 * @param {Object} geographicData - Datos geográficos { municipios, provincias, departamentos }
 * @returns {Object} { estudianteData, loadingEstudiante, error }
 */
export const useLoadStudent = (estudianteId, geographicData = {}) => {
  const { message } = App.useApp();
  const [estudianteData, setEstudianteData] = useState(null);
  const [loadingEstudiante, setLoadingEstudiante] = useState(false);
  const [error, setError] = useState(null);

  const { municipios = [], provincias = [], departamentos = [] } = geographicData;

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const cargarEstudiante = async () => {
      if (!estudianteId) {
        setEstudianteData(null);
        setError(null);
        return;
      }
      
      // Esperar a que los datos geográficos estén disponibles antes de resolver la cascada
      if (!municipios || municipios.length === 0 || 
          !provincias || provincias.length === 0 || 
          !departamentos || departamentos.length === 0) {
        console.log('[useLoadStudent] Esperando datos geográficos...');
        // Reintentar después de un breve delay
        setTimeout(() => {
          if (isMounted && estudianteId) {
            cargarEstudiante();
          }
        }, 500);
        return;
      }

      setLoadingEstudiante(true);
      setError(null);
      
      try {
        // Cargar datos del estudiante
        const estudianteResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}`);
        const estudiante = estudianteResponse.data?.data || estudianteResponse.data;
        
        if (!isMounted) return;

        // Cargar documentos del estudiante
        let documentos = [];
        try {
          const documentosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/documentos`);
          documentos = documentosResponse.data?.data || documentosResponse.data || [];
        } catch (err) {
          // Si es 404, no hay documentos, eso está bien
          if (err.response?.status !== 404) {
            console.warn('[useLoadStudent] Error inesperado al cargar documentos:', err);
          }
        }

        // Cargar datos académicos del estudiante
        let datosAcademicos = null;
        try {
          const academicosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/datos-academicos`);
          datosAcademicos = academicosResponse.data?.data || academicosResponse.data;
        } catch (err) {
          console.warn('[useLoadStudent] Error al cargar datos académicos:', err);
        }

        // Resolver cascada geográfica completa
        let estudianteResuelto = resolveAllGeographicCascades(
          estudiante,
          municipios,
          provincias,
          departamentos
        );

        // Formatear datos para el formulario
        const datosFormateados = formatStudentDataForForm(
          estudianteResuelto,
          documentos,
          datosAcademicos,
          estudianteId
        );

        if (isMounted) {
          setEstudianteData(datosFormateados);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[useLoadStudent] Error al cargar estudiante:', err);
          setError(err);
          message.error('Error al cargar los datos del estudiante. Por favor, intenta nuevamente.');
        }
      } finally {
        if (isMounted) {
          setLoadingEstudiante(false);
        }
      }
    };

    cargarEstudiante();
    
    // Cleanup
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [estudianteId, municipios, provincias, departamentos, message]);

  return { estudianteData, loadingEstudiante, error };
};
