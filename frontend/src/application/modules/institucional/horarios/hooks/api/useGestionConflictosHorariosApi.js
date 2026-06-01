import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { GESTIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export function useGestionConflictosHorariosApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchConflictos = useCallback(async (gestionId) => {
    const gId = Number(gestionId);
    if (!Number.isFinite(gId) || gId < 1) {
      const msg = 'ID de gestión inválido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(GESTIONES_ENDPOINTS.CONFLICTOS(gId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || 'No se pudieron cargar los conflictos';
        setError(msg);
        setData(null);
        return { success: false, error: msg };
      }
      const payload = result.data ?? null;
      setData(payload);
      return { success: true, data: payload };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudieron cargar los conflictos');
      setError(fail.error);
      setData(null);
      return { success: false, error: fail.error, raw: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, fetchConflictos };
}
