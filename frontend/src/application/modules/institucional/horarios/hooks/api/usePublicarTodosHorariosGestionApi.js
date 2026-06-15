/**
 * POST /api/v1/gestiones/:id/publicar-todos
 */

import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { GESTIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export function usePublicarTodosHorariosGestionApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const publicarTodos = useCallback(async (gestionId) => {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      const msg = 'ID de gestión inválido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(GESTIONES_ENDPOINTS.PUBLICAR_TODOS(gId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || 'No se pudo ejecutar la publicación masiva';
        setError(msg);
        setResultado(null);
        return { success: false, error: msg };
      }

      const payload = result.data ?? null;
      setResultado(payload);
      return { success: true, data: payload };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo ejecutar la publicación masiva');
      setError(fail.error);
      setResultado(null);
      return { success: false, error: fail.error, raw: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, resultado, publicarTodos };
}
