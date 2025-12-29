// application/modules/estudiantes/hooks/useLoadStudent.js
/**
 * Hook para cargar datos de un estudiante existente
 * 
 * Responsabilidad: Cargar datos del estudiante, documentos y datos académicos
 * desde el backend y formatearlos para el formulario
 */

import { useState, useEffect } from 'react';
import { App } from 'antd';
import apiClient from '@api-client';
import { formatStudentDataForForm, resolveAllGeographicCascades } from '@estudiantes/helpers';

/**
 * Hook para cargar datos de un estudiante existente
 * @param {string|number|null} estudianteId - ID del estudiante a cargar
 * @param {Object} geographicData - Datos geográficos { municipios, provincias, departamentos }
 * @returns {Object} { estudianteData, loadingEstudiante, error }
 */
export const useLoadStudent = (estudianteId, geographicData = {}, documentacionInscripcion = []) => {
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
      
      // MODIFICADO: No esperar datos geográficos si están deshabilitados para diagnóstico
      // Si los arrays están vacíos pero fueron inicializados, continuar sin ellos
      const datosGeograficosDisponibles = 
        (municipios && municipios.length > 0) || 
        (provincias && provincias.length > 0) || 
        (departamentos && departamentos.length > 0);
      
      // Si los datos geográficos no están disponibles, intentar cargar el estudiante de todas formas
      // (útil cuando los catálogos están deshabilitados para diagnóstico)
      if (!datosGeograficosDisponibles) {
        console.log('[useLoadStudent] Datos geográficos no disponibles, cargando estudiante sin resolver cascada geográfica...');
        // Continuar sin esperar, pero loguear advertencia
      }

      setLoadingEstudiante(true);
      setError(null);
      
      try {
        console.log(`[useLoadStudent] Iniciando carga de estudiante ID: ${estudianteId}`);
        
        // Cargar datos del estudiante
        const estudianteResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}`);
        const estudiante = estudianteResponse.data?.data || estudianteResponse.data;
        
        console.log('[useLoadStudent] Datos del estudiante recibidos:', {
          tieneDatos: !!estudiante,
          estudianteId: estudiante?.id,
          nombres: estudiante?.nombres,
        });
        
        if (!isMounted) return;
        
        if (!estudiante) {
          console.error('[useLoadStudent] No se recibieron datos del estudiante');
          throw new Error('No se encontraron datos del estudiante');
        }

        // Cargar documentos digitales del estudiante (archivos subidos)
        let documentos = [];
        try {
          const documentosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/documentos`);
          documentos = documentosResponse.data?.data || documentosResponse.data || [];
        } catch (err) {
          // Si es 404, no hay documentos, eso está bien
          if (err.response?.status !== 404) {
            console.warn('[useLoadStudent] Error inesperado al cargar documentos digitales:', err);
          }
        }

        // Cargar entregas físicas de documentos (estudiantes_documentos_entrega)
        let entregasDocumentos = [];
        try {
          const entregasResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/documentos-entregados`);
          entregasDocumentos = entregasResponse.data?.data || entregasResponse.data || [];
        } catch (err) {
          // Si es 404, no hay entregas, eso está bien
          if (err.response?.status !== 404) {
            console.warn('[useLoadStudent] Error inesperado al cargar entregas de documentos:', err);
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

        // Resolver cascada geográfica completa (solo si hay datos geográficos disponibles)
        let estudianteResuelto = estudiante;
        if (datosGeograficosDisponibles) {
          estudianteResuelto = resolveAllGeographicCascades(
            estudiante,
            municipios || [],
            provincias || [],
            departamentos || []
          );
        } else {
          console.warn('[useLoadStudent] No se puede resolver cascada geográfica - datos geográficos no disponibles');
          console.warn('[useLoadStudent] El estudiante se cargará con IDs directos (sin nombres resueltos)');
        }

        // Formatear datos para el formulario
        const datosFormateados = formatStudentDataForForm(
          estudianteResuelto,
          documentos,
          datosAcademicos,
          estudianteId,
          entregasDocumentos,
          documentacionInscripcion
        );

        console.log('[useLoadStudent] Datos formateados para el formulario:', {
          tieneDatos: !!datosFormateados,
          keys: datosFormateados ? Object.keys(datosFormateados) : [],
        });

        if (isMounted) {
          setEstudianteData(datosFormateados);
          console.log('[useLoadStudent] ✓ Estudiante cargado correctamente');
        }
      } catch (err) {
        if (isMounted) {
          console.error('[useLoadStudent] ✗ Error al cargar estudiante:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
            statusText: err.response?.statusText,
            url: err.config?.url,
            estudianteId,
          });
          setError(err);
          const errorMessage = err.response?.data?.error?.message || 
                              err.response?.data?.message ||
                              err.message ||
                              'Error al cargar los datos del estudiante';
          message.error(errorMessage);
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
