/**
 * Lista planes de estudio (GET /v1/planes-estudios).
 */

import { useCallback, useEffect, useState } from 'react';
import apiClient from '@api-client';
import { PLANES_ESTUDIOS_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { CATALOG_LIST_LIMIT, DEFAULT_LIST_PAGE } from '@application/constants/listPagination';

export function usePlanesEstudiosApi({ carreraId, autoFetch = true } = {}) {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlanes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: DEFAULT_LIST_PAGE,
        limit: CATALOG_LIST_LIMIT,
        ...(carreraId ? { carrera_id: carreraId } : {}),
      };
      const response = await apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.BASE, { params });
      const result = handleSuccessResponse(response);
      if (!result.success) {
        setError(result.error || 'No se pudieron cargar los planes');
        setPlanes([]);
        return;
      }
      const raw = result.data?.planes_estudios ?? result.data;
      setPlanes(Array.isArray(raw) ? raw : []);
    } catch (err) {
      const fail = handleErrorResponse(err, 'Error al cargar planes de estudio');
      setError(fail.error);
      setPlanes([]);
    } finally {
      setLoading(false);
    }
  }, [carreraId]);

  useEffect(() => {
    if (autoFetch) {
      fetchPlanes();
    }
  }, [autoFetch, fetchPlanes]);

  return { planes, loading, error, refetch: fetchPlanes };
}
