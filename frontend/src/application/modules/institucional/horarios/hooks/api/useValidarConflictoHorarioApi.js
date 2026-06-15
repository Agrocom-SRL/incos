import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { CONFLICTOS_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

/**
 * POST /conflictos/validar — pre-chequeo antes de mover o crear un bloque en armado.
 */
export function useValidarConflictoHorarioApi() {
  const [loading, setLoading] = useState(false);

  const validar = useCallback(async (payload) => {
    setLoading(true);
    try {
      const excludeRaw =
        payload.asignacion_horario_id ??
        payload.asignacionHorarioId ??
        payload.excludeAsignacionHorarioId ??
        payload.exclude_id;
      const excludeId = Number(excludeRaw);
      const body = {
        asignacion_docente_id:
          payload.asignacion_docente_id ?? payload.asignacionDocenteId,
        horario_id: payload.horario_id ?? payload.horarioId,
        aula_id: payload.aula_id ?? payload.aulaId ?? null,
      };
      if (Number.isFinite(excludeId) && excludeId > 0) {
        body.asignacion_horario_id = excludeId;
      }

      const response = await apiClient.post(CONFLICTOS_ENDPOINTS.VALIDAR, body);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return {
          valido: false,
          conflictos: [],
          error: result.error || 'No se pudo validar el bloque',
        };
      }
      const data = result.data ?? {};
      return {
        valido: data.valido === true,
        conflictos: Array.isArray(data.conflictos) ? data.conflictos : [],
      };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo validar el bloque');
      return { valido: false, conflictos: [], error: fail.error };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, validar };
}
