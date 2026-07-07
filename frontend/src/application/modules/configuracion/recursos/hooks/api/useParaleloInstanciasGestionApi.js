import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { PARALELOS_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { normalizeFieldToArray } from '@application/utils';

export const useParaleloInstanciasGestionApi = () => {
  const [instancias, setInstancias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchByParaleloId = useCallback(async (paraleloId) => {
    const id = Number(paraleloId);
    if (!Number.isFinite(id) || id < 1) {
      setInstancias([]);
      return { success: false, error: 'ID de paralelo inválido' };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(PARALELOS_ENDPOINTS.PARALELOS_GESTION_BY_PARALELO(id));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || 'No se pudieron cargar instancias en gestión';
        setError(msg);
        setInstancias([]);
        return { success: false, error: msg };
      }
      const list = normalizeFieldToArray(result.data, 'paralelosGestion');
      setInstancias(list);
      return { success: true, data: list };
    } catch (e) {
      const fail = handleErrorResponse(e, 'No se pudieron cargar instancias en gestión');
      setError(fail.error);
      setInstancias([]);
      return { success: false, error: fail.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setInstancias([]);
    setError(null);
    setLoading(false);
  }, []);

  return { instancias, loading, error, fetchByParaleloId, reset };
};
