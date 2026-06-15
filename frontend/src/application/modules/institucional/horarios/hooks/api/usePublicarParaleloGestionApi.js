/**
 * POST /api/v1/paralelos-gestion/:id/publicar
 */

import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { PARALELOS_GESTION_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export function usePublicarParaleloGestionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const publicar = useCallback(async (paraleloGestionId) => {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      const msg = 'ID de paralelo en gestión inválido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(PARALELOS_GESTION_ENDPOINTS.PUBLICAR(pgId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || 'No se pudo publicar el paralelo';
        setError(msg);
        return { success: false, error: msg, details: result.details };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo publicar el paralelo');
      setError(fail.error);
      return { success: false, error: fail.error, details: fail.details, raw: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, publicar };
}
