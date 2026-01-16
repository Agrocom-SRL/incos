/**
 * Hook: useGenerateActaCompromiso
 * 
 * Single Responsibility: Manejar la generación y descarga del acta de compromiso
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la llamada al API y maneja la descarga del archivo
 * 
 * Funcionalidad:
 * - Llama al endpoint POST para generar el acta de compromiso
 * - Si success: true, descarga el archivo PDF automáticamente
 * - Si success: false, retorna el error para mostrar al usuario
 */

import { useState, useCallback } from 'react';
import apiClient from '@api-client';
import { ESTUDIANTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export const useGenerateActaCompromiso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Descarga un archivo desde la ruta proporcionada
   * @param {string} filePath - Ruta relativa del archivo (ej: /uploads/documentos/estudiantes/3/ACTA_COMPROMISO_3_xxx.pdf)
   * @param {string} fileName - Nombre del archivo para la descarga
   */
  const downloadFile = useCallback((filePath, fileName) => {
    try {
      // Los archivos estáticos se sirven directamente en /uploads (sin /api)
      // Usar window.location.origin para obtener la base URL del servidor
      const baseUrl = window.location.origin;
      const fileUrl = `${baseUrl}${filePath}`;

      // Crear un elemento <a> temporal para descargar el archivo
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'acta_compromiso.pdf';
      link.target = '_blank';
      
      // Agregar al DOM, hacer click, y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar el archivo:', err);
      throw new Error('No se pudo descargar el archivo');
    }
  }, []);

  /**
   * Genera y descarga el acta de compromiso para un estudiante
   * @param {string|number} studentId - ID del estudiante
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const generateActaCompromiso = useCallback(async (studentId) => {
    if (!studentId) {
      const errorMsg = 'ID de estudiante requerido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al endpoint POST para generar el acta
      const response = await apiClient.post(
        ESTUDIANTES_ENDPOINTS.GENERATE_ACTA_COMPROMISO(studentId)
      );

      // Procesar respuesta
      const result = handleSuccessResponse(response);

      // Si el acta se generó exitosamente, descargar el archivo
      if (result.success && result.data?.acta) {
        const { filePath, fileName } = result.data.acta;
        
        if (filePath) {
          downloadFile(filePath, fileName);
        }
      }

      setLoading(false);
      return result;
    } catch (err) {
      const errorResult = handleErrorResponse(err, 'Error al generar el acta de compromiso');
      setError(errorResult.error);
      setLoading(false);
      return errorResult;
    }
  }, [downloadFile]);

  return {
    generateActaCompromiso,
    loading,
    error,
  };
};
