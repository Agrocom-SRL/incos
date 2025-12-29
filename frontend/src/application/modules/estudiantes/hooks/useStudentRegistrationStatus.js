/**
 * Hook personalizado: useStudentRegistrationStatus
 * 
 * Single Responsibility: Maneja la verificación del estado de registro de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la verificación de datos de registro
 * - Usa apiClient para comunicarse con el backend
 * 
 * Este hook:
 * - Verifica si un estudiante tiene documentos y datos académicos
 * - Maneja el estado de verificación para múltiples estudiantes
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@api-client';

/**
 * Hook para verificar el estado de registro de estudiantes
 * @param {Array} estudiantesList - Lista de estudiantes a verificar
 * @returns {Object} Estado de verificación y función para verificar un estudiante individual
 */
export const useStudentRegistrationStatus = (estudiantesList = []) => {
  const [registrosIncompletos, setRegistrosIncompletos] = useState({});

  /**
   * Verifica si un estudiante tiene registro incompleto
   * @param {number} estudianteId - ID del estudiante a verificar
   * @returns {Promise<Object>} Estado del registro { tieneDocumentos, tieneDatosAcademicos, incompleto }
   */
  const verificarRegistroIncompleto = useCallback(async (estudianteId) => {
    try {
      // Verificar documentos del estudiante
      let tieneDocumentos = false;
      try {
        const documentosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/documentos`);
        tieneDocumentos = (documentosResponse.data?.data?.length > 0) ||
          (documentosResponse.data?.length > 0);
      } catch (err) {
        // Si el endpoint retorna 404 o error, asumimos que no hay documentos
        if (err.response?.status === 404) {
          tieneDocumentos = false;
        } else {
          console.warn(`Error al verificar documentos del estudiante ${estudianteId}:`, err);
          tieneDocumentos = false;
        }
      }

      // Verificar datos académicos del estudiante
      // Nota: Necesitamos un endpoint para obtener datos académicos, por ahora asumimos que no hay
      // TODO: Crear endpoint GET /v1/estudiantes/:id/datos-academicos
      let tieneDatosAcademicos = false;
      try {
        const academicosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/datos-academicos`);
        tieneDatosAcademicos = !!academicosResponse.data?.data;
      } catch (err) {
        // Si el endpoint no existe (404) o hay error, asumimos que no hay datos académicos
        if (err.response?.status === 404) {
          tieneDatosAcademicos = false;
        } else {
          console.warn(`Error al verificar datos académicos del estudiante ${estudianteId}:`, err);
          tieneDatosAcademicos = false;
        }
      }

      return {
        tieneDocumentos,
        tieneDatosAcademicos,
        incompleto: !tieneDocumentos || !tieneDatosAcademicos
      };
    } catch (err) {
      console.error(`Error al verificar registro del estudiante ${estudianteId}:`, err);
      // Si hay error, asumimos que está incompleto para mostrar el botón
      return {
        tieneDocumentos: false,
        tieneDatosAcademicos: false,
        incompleto: true
      };
    }
  }, []);

  // Verificar registros incompletos después de cargar estudiantes
  useEffect(() => {
    const verificarTodos = async () => {
      const incompletos = {};
      for (const estudiante of estudiantesList) {
        if (estudiante.id) {
          const estado = await verificarRegistroIncompleto(estudiante.id);
          incompletos[estudiante.id] = estado;
        }
      }
      setRegistrosIncompletos(incompletos);
    };

    if (estudiantesList.length > 0) {
      verificarTodos();
    } else {
      setRegistrosIncompletos({});
    }
  }, [estudiantesList, verificarRegistroIncompleto]);

  return {
    registrosIncompletos,
    verificarRegistroIncompleto,
  };
};

