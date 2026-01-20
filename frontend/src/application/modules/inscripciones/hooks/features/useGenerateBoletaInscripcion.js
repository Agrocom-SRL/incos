/**
 * Hook: useGenerateBoletaInscripcion
 * 
 * Single Responsibility: Manejar la generación y descarga de la boleta de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la llamada al API y maneja la descarga del archivo
 * 
 * Funcionalidad:
 * - Llama al endpoint POST para generar la boleta de inscripción
 * - Si success: true, descarga el archivo PDF automáticamente
 * - Si success: false, retorna el error para mostrar al usuario
 */

import { useState, useCallback } from 'react';
import apiClient from '@api-client';
import { INSCRIPCIONES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export const useGenerateBoletaInscripcion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Descarga un archivo desde la ruta proporcionada
   * @param {string} filePath - Ruta relativa del archivo (ej: /uploads/documentos/estudiantes/3/BOLETA_INSCRIPCION_3_xxx.pdf)
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
      link.download = fileName || 'boleta_inscripcion.pdf';
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
   * Genera y descarga la boleta de inscripción para una inscripción existente
   * @param {string|number} enrollmentId - ID de la inscripción
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const generateBoletaInscripcion = useCallback(async (enrollmentId) => {
    if (!enrollmentId) {
      const errorMsg = 'ID de inscripción requerido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al endpoint POST para generar la boleta
      // Aumentar timeout a 60 segundos porque la generación de PDF puede tardar
      const response = await apiClient.post(
        INSCRIPCIONES_ENDPOINTS.GENERATE_BOLETA(enrollmentId),
        {},
        {
          timeout: 60000, // 60 segundos para generación de PDF
        }
      );

      // Procesar respuesta
      const result = handleSuccessResponse(response);

      // Si la boleta se generó exitosamente, descargar el archivo
      if (result.success && result.data?.boleta) {
        const { filePath, fileName } = result.data.boleta;
        
        if (filePath) {
          downloadFile(filePath, fileName);
        }
      }

      setLoading(false);
      return result;
    } catch (err) {
      const errorResult = handleErrorResponse(err, 'Error al generar la boleta de inscripción');
      setError(errorResult.error);
      setLoading(false);
      return errorResult;
    }
  }, [downloadFile]);

  return {
    generateBoletaInscripcion,
    loading,
    error,
  };
};
