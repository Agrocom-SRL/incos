/**
 * API de color docente (paleta + PUT /docentes/:id/color).
 */

import { useCallback } from 'react';
import apiClient from '@api-client';
import { DOCENTES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export function useDocenteColorApi() {
  const fetchColoresSugeridos = useCallback(async () => {
    try {
      const response = await apiClient.get(DOCENTES_ENDPOINTS.COLORES_SUGERIDOS);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo cargar la paleta' };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo cargar la paleta');
      return { success: false, error: fail.error };
    }
  }, []);

  const updateDocenteColor = useCallback(async (docenteId, colorHex) => {
    try {
      const response = await apiClient.put(DOCENTES_ENDPOINTS.COLOR(docenteId), { color_hex: colorHex });
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo guardar el color' };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo guardar el color');
      return { success: false, error: fail.error };
    }
  }, []);

  return { fetchColoresSugeridos, updateDocenteColor };
}
