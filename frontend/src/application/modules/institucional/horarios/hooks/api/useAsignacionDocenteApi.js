/**
 * Cliente API — asignación docente Sprint 4 (matriz + color + carga).
 */

import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import {
  ASIGNACIONES_DOCENTES_ENDPOINTS,
  DOCENTES_ENDPOINTS,
  GESTIONES_ENDPOINTS,
  PARALELOS_GESTION_ENDPOINTS,
} from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export function useAsignacionDocenteApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (fn, fallbackMessage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fn();
      const result = handleSuccessResponse(response);
      if (!result.success) {
        const msg = result.error || fallbackMessage;
        setError(msg);
        return { success: false, error: msg };
      }
      return { success: true, data: result.data, pagination: result.pagination };
    } catch (err) {
      const fail = handleErrorResponse(err, fallbackMessage);
      setError(fail.error);
      return { success: false, error: fail.error, raw: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAsignaciones = useCallback(
    (params = {}) =>
      run(
        () =>
          apiClient.get(ASIGNACIONES_DOCENTES_ENDPOINTS.BASE, {
            params: { page: 1, limit: 500, vigente: true, ...params },
          }),
        'No se pudieron cargar las asignaciones'
      ),
    [run]
  );

  const fetchOfertaCursos = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.OFERTA_CURSOS(paraleloGestionId)),
        'No se pudo cargar la oferta del paralelo'
      ),
    [run]
  );

  const fetchCobertura = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.COBERTURA_DOCENTE(paraleloGestionId)),
        'No se pudo cargar la cobertura docente'
      ),
    [run]
  );

  const fetchCargaGestion = useCallback(
    (gestionId) =>
      run(
        () => apiClient.get(GESTIONES_ENDPOINTS.CARGA_DOCENTES(gestionId)),
        'No se pudo cargar el dashboard de carga docente'
      ),
    [run]
  );

  const fetchCargaDocente = useCallback(
    (docenteId, gestionId) =>
      run(
        () =>
          apiClient.get(DOCENTES_ENDPOINTS.CARGA_GESTION(docenteId), {
            params: { gestion_id: gestionId },
          }),
        'No se pudo cargar la carga del docente'
      ),
    [run]
  );

  const fetchColoresSugeridos = useCallback(
    () => run(() => apiClient.get(DOCENTES_ENDPOINTS.COLORES_SUGERIDOS), 'No se pudo cargar la paleta de colores'),
    [run]
  );

  const createAsignacion = useCallback(
    (body) =>
      run(
        () => apiClient.post(ASIGNACIONES_DOCENTES_ENDPOINTS.BASE, body),
        'No se pudo asignar el docente'
      ),
    [run]
  );

  const deleteAsignacion = useCallback(
    (asignacionId) =>
      run(
        () => apiClient.delete(ASIGNACIONES_DOCENTES_ENDPOINTS.BY_ID(asignacionId)),
        'No se pudo quitar la asignación'
      ),
    [run]
  );

  const updateDocenteColor = useCallback(
    (docenteId, colorHex) =>
      run(
        () => apiClient.put(DOCENTES_ENDPOINTS.COLOR(docenteId), { color_hex: colorHex }),
        'No se pudo guardar el color del docente'
      ),
    [run]
  );

  return {
    loading,
    error,
    fetchAsignaciones,
    fetchOfertaCursos,
    fetchCobertura,
    fetchCargaGestion,
    fetchCargaDocente,
    fetchColoresSugeridos,
    createAsignacion,
    deleteAsignacion,
    updateDocenteColor,
  };
}
