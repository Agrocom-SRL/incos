/**
 * Hook: useGenerateDeclaracionJurada
 *
 * Single Responsibility: Generar y descargar la declaración jurada
 * del formulario de registro de estudiante (boleta de inscripción).
 *
 * Clean Architecture:
 * - Application Layer: orquesta la llamada al API de inscripciones
 *   y maneja la descarga del archivo resultante.
 */

import { useState, useCallback } from 'react';
import apiClient from '@api-client';
import { ESTUDIANTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export const useGenerateDeclaracionJurada = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const downloadFile = useCallback((filePath, fileName) => {
    try {
      const baseUrl = window.location.origin;

      let normalizedPath = (filePath || '').trim();
      normalizedPath = normalizedPath.replace(/^\.\//, '');
      normalizedPath = normalizedPath.replace(/^\.\.\//, '');
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`;
      }
      normalizedPath = normalizedPath.replace(/\/+/g, '/');

      const fileUrl = `${baseUrl}${normalizedPath}`;

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'declaracion_jurada.pdf';
      link.target = '_blank';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar la declaración jurada:', err);
      throw new Error('No se pudo descargar la declaración jurada');
    }
  }, []);

  /**
   * Genera y descarga la declaración jurada (boleta/formulario)
   * para un estudiante específico.
   *
   * @param {string|number} studentId
   * @param {{ tipoAdmision?: string }} [options] - Opciones adicionales para el backend
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const generateDeclaracionJurada = useCallback(
    async (studentId, options = {}) => {
      if (!studentId) {
        const errorMsg = 'ID de estudiante requerido';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setLoading(true);
      setError(null);

      try {
        const payload = {};
        if (options.tipoAdmision) {
          payload.tipoAdmision = options.tipoAdmision;
        }

        const response = await apiClient.post(
          ESTUDIANTES_ENDPOINTS.GENERATE_DECLARACION_JURADA(studentId),
          payload
        );

        const result = handleSuccessResponse(response);

        if (result.success && result.data) {
          const { filePath, fileName } = result.data;
          if (filePath) {
            downloadFile(filePath, fileName);
          }
        }

        setLoading(false);
        return result;
      } catch (err) {
        const errorResult = handleErrorResponse(
          err,
          'Error al generar la declaración jurada'
        );
        setError(errorResult.error);
        setLoading(false);
        return errorResult;
      }
    },
    [downloadFile]
  );

  return {
    generateDeclaracionJurada,
    loading,
    error,
  };
};

