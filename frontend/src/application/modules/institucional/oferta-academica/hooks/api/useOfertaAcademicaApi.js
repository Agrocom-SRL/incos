/**
 * Cliente API — Oferta Académica (Sprint 3).
 */

import { useCallback, useState } from 'react';
import apiClient from '@api-client';
import {
  AULAS_CATALOGO_ENDPOINT,
  GESTIONES_ENDPOINTS,
  GESTIONES_PLANES_ENDPOINTS,
  OFERTA_CURSOS_ENDPOINTS,
  PARALELOS_GESTION_ENDPOINTS,
  PLANES_ESTUDIOS_ENDPOINTS,
} from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export function useOfertaAcademicaApi() {
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
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, fallbackMessage);
      setError(fail.error);
      return { success: false, error: fail.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGestiones = useCallback(
    () =>
      run(
        () =>
          apiClient.get(GESTIONES_ENDPOINTS.BASE, {
            params: { page: 1, limit: 200 },
          }),
        'No se pudieron cargar las gestiones'
      ),
    [run]
  );

  const marcarGestionVigente = useCallback(
    (gestionId) =>
      run(
        () => apiClient.post(GESTIONES_ENDPOINTS.MARCAR_VIGENTE(gestionId)),
        'No se pudo marcar la gestión como vigente'
      ),
    [run]
  );

  const fetchPlanesHabilitados = useCallback(
    (gestionId) =>
      run(
        () => apiClient.get(GESTIONES_ENDPOINTS.PLANES_HABILITADOS(gestionId)),
        'No se pudieron cargar los planes habilitados'
      ),
    [run]
  );

  const fetchPlanesVigentesCatalogo = useCallback(
    () =>
      run(
        () =>
          apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.BASE, {
            params: { page: 1, limit: 500, vigente: 1 },
          }),
        'No se pudieron cargar los planes vigentes'
      ),
    [run]
  );

  const habilitarPlan = useCallback(
    (body) =>
      run(
        () => apiClient.post(GESTIONES_PLANES_ENDPOINTS.BASE, body),
        'No se pudo habilitar el plan en la gestión'
      ),
    [run]
  );

  const fetchParalelosGestion = useCallback(
    (gestionPlanId) =>
      run(
        () => apiClient.get(GESTIONES_PLANES_ENDPOINTS.PARALELOS_GESTION(gestionPlanId)),
        'No se pudieron cargar los paralelos de gestión'
      ),
    [run]
  );

  const generarParalelosGestion = useCallback(
    (gestionPlanId) =>
      run(
        () => apiClient.post(GESTIONES_PLANES_ENDPOINTS.GENERAR_PARALELOS(gestionPlanId)),
        'No se pudieron generar los paralelos de gestión'
      ),
    [run]
  );

  const validarOferta = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.VALIDAR_OFERTA(paraleloGestionId)),
        'No se pudo validar la oferta del paralelo'
      ),
    [run]
  );

  const generarOferta = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.post(PARALELOS_GESTION_ENDPOINTS.GENERAR_OFERTA(paraleloGestionId)),
        'No se pudo generar la oferta de cursos'
      ),
    [run]
  );

  const updateParaleloGestion = useCallback(
    (id, body) =>
      run(
        () => apiClient.put(PARALELOS_GESTION_ENDPOINTS.BY_ID(id), body),
        'No se pudo actualizar el paralelo de gestión'
      ),
    [run]
  );

  const cambiarTurnoParaleloGestion = useCallback(
    (id, turno) =>
      run(
        () => apiClient.put(PARALELOS_GESTION_ENDPOINTS.CAMBIAR_TURNO(id), { turno }),
        'No se pudo cambiar el turno'
      ),
    [run]
  );

  const updateParaleloGestionEstado = useCallback(
    (id, estado) =>
      run(
        () => apiClient.put(PARALELOS_GESTION_ENDPOINTS.ESTADO(id), { estado }),
        'No se pudo actualizar el estado del paralelo'
      ),
    [run]
  );

  const fetchParaleloGestionDetalle = useCallback(
    (id) =>
      run(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.BY_ID(id)),
        'No se pudo cargar el detalle del paralelo'
      ),
    [run]
  );

  const fetchOfertaCursos = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.OFERTA_CURSOS(paraleloGestionId)),
        'No se pudo cargar la oferta de cursos'
      ),
    [run]
  );

  const crearOfertaCursoManual = useCallback(
    (body) =>
      run(
        () => apiClient.post(OFERTA_CURSOS_ENDPOINTS.BASE, body),
        'No se pudo agregar el curso a la oferta'
      ),
    [run]
  );

  const eliminarOfertaCurso = useCallback(
    (id) =>
      run(
        () => apiClient.delete(OFERTA_CURSOS_ENDPOINTS.BY_ID(id)),
        'No se pudo eliminar el curso de la oferta'
      ),
    [run]
  );

  const fetchAulasCatalogo = useCallback(
    () => run(() => apiClient.get(AULAS_CATALOGO_ENDPOINT), 'No se pudieron cargar las aulas'),
    [run]
  );

  return {
    loading,
    error,
    fetchGestiones,
    marcarGestionVigente,
    fetchPlanesHabilitados,
    fetchPlanesVigentesCatalogo,
    habilitarPlan,
    fetchParalelosGestion,
    generarParalelosGestion,
    validarOferta,
    generarOferta,
    updateParaleloGestion,
    cambiarTurnoParaleloGestion,
    updateParaleloGestionEstado,
    fetchParaleloGestionDetalle,
    fetchOfertaCursos,
    crearOfertaCursoManual,
    eliminarOfertaCurso,
    fetchAulasCatalogo,
  };
}
