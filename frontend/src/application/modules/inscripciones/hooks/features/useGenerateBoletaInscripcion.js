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
      // Vite tiene un proxy configurado para /uploads que redirige al backend
      const baseUrl = window.location.origin;
      
      // Normalizar el filePath:
      // - Remover cualquier prefijo relativo (./, ../)
      // - Asegurar que empiece con /
      // - Remover dobles barras
      let normalizedPath = (filePath || '').trim();
      
      // Remover prefijos relativos si existen
      normalizedPath = normalizedPath.replace(/^\.\//, '');
      normalizedPath = normalizedPath.replace(/^\.\.\//, '');
      
      // Asegurar que empiece con /
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`;
      }
      
      // Remover dobles barras
      normalizedPath = normalizedPath.replace(/\/+/g, '/');
      
      const fileUrl = `${baseUrl}${normalizedPath}`;

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
   * Genera y descarga la boleta de inscripción para un estudiante
   * @param {string|number} studentId - ID del estudiante
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const generateBoletaInscripcion = useCallback(async (studentId) => {
    if (!studentId) {
      const errorMsg = 'ID del estudiante requerido';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar al endpoint POST para generar la boleta
      // El endpoint espera el ID del estudiante, no el ID de la inscripción
      // Aumentar timeout a 60 segundos porque la generación de PDF puede tardar
      const response = await apiClient.post(
        INSCRIPCIONES_ENDPOINTS.GENERATE_BOLETA(studentId),
        {},
        {
          timeout: 60000, // 60 segundos para generación de PDF
        }
      );

      // Procesar respuesta
      const result = handleSuccessResponse(response);

      // Si la boleta se generó exitosamente, descargar el archivo
      // El backend devuelve {filePath, fileName, absolutePath} directamente en result.data
      if (result.success && result.data) {
        const { filePath, fileName } = result.data;
        
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
