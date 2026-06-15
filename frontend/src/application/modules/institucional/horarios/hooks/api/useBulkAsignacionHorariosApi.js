import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import { ASIGNACION_HORARIOS_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';
import { summarizeBulkAsignacionHorarios } from '@application-institucional/horarios/utils/summarizeBulkAsignacionHorarios';

export function useBulkAsignacionHorariosApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ejecutarBulk = useCallback(async (items, options = {}) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'No hay cambios para guardar' };
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { items };
      if (options.coberturaReajuste === true) {
        payload.cobertura_reajuste = true;
      }
      const response = await apiClient.post(ASIGNACION_HORARIOS_ENDPOINTS.BULK, payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || 'No se pudo guardar los bloques';
        setError(msg);
        return { success: false, error: msg, details: result.details };
      }

      const bulkMsg = summarizeBulkAsignacionHorarios(result.data);
      if (bulkMsg) {
        setError(bulkMsg);
        return {
          success: false,
          error: bulkMsg,
          data: result.data,
          partial: true,
        };
      }

      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo guardar los bloques');
      setError(fail.error);
      return { success: false, error: fail.error, details: fail.details, raw: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, ejecutarBulk };
}
