/**
 * GET /api/v1/paralelos-gestion/:id/grilla-horario
 * Payload en `data` (raíz): paralelo_gestion_id, turno, grilla, conflictos, cobertura.
 */

import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { PARALELOS_GESTION_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

/**
 * @returns {{
 *   loading: boolean,
 *   error: string|null,
 *   grillaHorario: object|null,
 *   fetchGrillaHorario: (paraleloGestionId: number|string) => Promise<{ success: boolean, data?: object, error?: string }>,
 *   reset: () => void,
 * }}
 */
export function useParaleloGestionGrillaHorarioApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [grillaHorario, setGrillaHorario] = useState(null);

  const reset = useCallback(() => {
    setGrillaHorario(null);
    setError(null);
    setLoading(false);
  }, []);

  const fetchGrillaHorario = useCallback(async (paraleloGestionId) => {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      const msg = 'ID de paralelo en gestión inválido';
      setError(msg);
      return { success: false, error: msg };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(PARALELOS_GESTION_ENDPOINTS.GRILLA_HORARIO(pgId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || 'No se pudo cargar la grilla de horarios';
        setError(msg);
        setGrillaHorario(null);
        return { success: false, error: msg };
      }

      const payload = result.data ?? null;
      setGrillaHorario(payload);
      return { success: true, data: payload };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo cargar la grilla de horarios');
      setError(fail.error);
      setGrillaHorario(null);
      return { success: false, error: fail.error, raw: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    grillaHorario,
    fetchGrillaHorario,
    reset,
  };
}
