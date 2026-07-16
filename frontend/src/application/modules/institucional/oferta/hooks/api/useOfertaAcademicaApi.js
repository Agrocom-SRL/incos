/**
 * Cliente API — Oferta académica (Sprint 3).
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

  /** Sin loading global: carga inicial en paralelo (evita parpadeos y bloqueo del hilo UI). */
  const runSilent = useCallback(async (fn, fallbackMessage) => {
    try {
      const response = await fn();
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || fallbackMessage };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, fallbackMessage);
      return { success: false, error: fail.error };
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

  const fetchGestionesSilent = useCallback(
    () =>
      runSilent(
        () =>
          apiClient.get(GESTIONES_ENDPOINTS.BASE, {
            params: { page: 1, limit: 200 },
          }),
        'No se pudieron cargar las gestiones'
      ),
    [runSilent]
  );

  const marcarGestionVigente = useCallback(
    (gestionId) =>
      run(
        () => apiClient.post(GESTIONES_ENDPOINTS.MARCAR_VIGENTE(gestionId)),
        'No se pudo marcar la gestión como vigente'
      ),
    [run]
  );

  /** POST /gestiones — alta de gestión (destino de la renovación de oferta). */
  const crearGestion = useCallback(
    (body) =>
      run(
        () => apiClient.post(GESTIONES_ENDPOINTS.BASE, body),
        'No se pudo crear la gestión'
      ),
    [run]
  );

  /** PUT /gestiones/:id — edición de datos base (vigente NO se edita aquí). */
  const actualizarGestion = useCallback(
    (gestionId, body) =>
      run(
        () => apiClient.put(GESTIONES_ENDPOINTS.BY_ID(gestionId), body),
        'No se pudo actualizar la gestión'
      ),
    [run]
  );

  /** POST /gestiones/:idDestino/renovar-oferta — copia paralelos/ofertas/asignaciones/bloques. */
  const renovarOferta = useCallback(
    (gestionDestinoId, body) =>
      run(
        () => apiClient.post(GESTIONES_ENDPOINTS.RENOVAR_OFERTA(gestionDestinoId), body),
        'No se pudo renovar la oferta académica'
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

  const fetchPlanesHabilitadosSilent = useCallback(
    (gestionId) =>
      runSilent(
        () => apiClient.get(GESTIONES_ENDPOINTS.PLANES_HABILITADOS(gestionId)),
        'No se pudieron cargar los planes habilitados'
      ),
    [runSilent]
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

  const fetchParalelosGestionSilent = useCallback(
    (gestionPlanId) =>
      runSilent(
        () => apiClient.get(GESTIONES_PLANES_ENDPOINTS.PARALELOS_GESTION(gestionPlanId)),
        'No se pudieron cargar los paralelos de gestión'
      ),
    [runSilent]
  );

  const generarParalelosGestion = useCallback(
    (gestionPlanId) =>
      run(
        () => apiClient.post(GESTIONES_PLANES_ENDPOINTS.GENERAR_PARALELOS(gestionPlanId)),
        'No se pudieron generar los paralelos de gestión'
      ),
    [run]
  );

  /** Lote en gestión de planes: evita parpadeo del loading global entre planes. */
  const generarParalelosGestionSilent = useCallback(async (gestionPlanId) => {
    try {
      const response = await apiClient.post(
        GESTIONES_PLANES_ENDPOINTS.GENERAR_PARALELOS(gestionPlanId)
      );
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'No se pudieron generar los paralelos de gestión',
        };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudieron generar los paralelos de gestión');
      return { success: false, error: fail.error };
    }
  }, []);

  /** Sin toggle de loading global: se invoca en lote desde el wizard (evita parpadeos y re-renders). */
  const validarOferta = useCallback(async (paraleloGestionId) => {
    try {
      const response = await apiClient.get(
        PARALELOS_GESTION_ENDPOINTS.VALIDAR_OFERTA(paraleloGestionId)
      );
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo validar la oferta del paralelo' };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo validar la oferta del paralelo');
      return { success: false, error: fail.error };
    }
  }, []);

  /** Sin toggle de loading global: se invoca en lote desde listados de paralelos. */
  const fetchCoberturaDocente = useCallback(async (paraleloGestionId) => {
    try {
      const response = await apiClient.get(
        PARALELOS_GESTION_ENDPOINTS.COBERTURA_DOCENTE(paraleloGestionId)
      );
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'No se pudo cargar la cobertura docente',
        };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo cargar la cobertura docente');
      return { success: false, error: fail.error };
    }
  }, []);

  const generarOferta = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.post(PARALELOS_GESTION_ENDPOINTS.GENERAR_OFERTA(paraleloGestionId)),
        'No se pudo generar la oferta de cursos'
      ),
    [run]
  );

  /** Lote desde Planes vigentes: evita parpadeo del loading global. */
  const generarOfertaSilent = useCallback(async (paraleloGestionId) => {
    try {
      const response = await apiClient.post(
        PARALELOS_GESTION_ENDPOINTS.GENERAR_OFERTA(paraleloGestionId)
      );
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'No se pudo generar la oferta de cursos',
        };
      }
      return { success: true, data: result.data };
    } catch (err) {
      const fail = handleErrorResponse(err, 'No se pudo generar la oferta de cursos');
      return { success: false, error: fail.error };
    }
  }, []);

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

  const fetchParaleloGestionDetalleSilent = useCallback(
    (id) =>
      runSilent(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.BY_ID(id)),
        'No se pudo cargar el detalle del paralelo'
      ),
    [runSilent]
  );

  const fetchOfertaCursos = useCallback(
    (paraleloGestionId) =>
      run(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.OFERTA_CURSOS(paraleloGestionId)),
        'No se pudo cargar la oferta de cursos'
      ),
    [run]
  );

  const fetchOfertaCursosSilent = useCallback(
    (paraleloGestionId) =>
      runSilent(
        () => apiClient.get(PARALELOS_GESTION_ENDPOINTS.OFERTA_CURSOS(paraleloGestionId)),
        'No se pudo cargar la oferta de cursos'
      ),
    [runSilent]
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

  const fetchAulasCatalogoSilent = useCallback(
    () => runSilent(() => apiClient.get(AULAS_CATALOGO_ENDPOINT), 'No se pudieron cargar las aulas'),
    [runSilent]
  );

  return {
    loading,
    error,
    fetchGestiones,
    fetchGestionesSilent,
    marcarGestionVigente,
    crearGestion,
    actualizarGestion,
    renovarOferta,
    fetchPlanesHabilitados,
    fetchPlanesHabilitadosSilent,
    fetchPlanesVigentesCatalogo,
    habilitarPlan,
    fetchParalelosGestion,
    fetchParalelosGestionSilent,
    generarParalelosGestion,
    generarParalelosGestionSilent,
    validarOferta,
    fetchCoberturaDocente,
    generarOferta,
    generarOfertaSilent,
    updateParaleloGestion,
    cambiarTurnoParaleloGestion,
    updateParaleloGestionEstado,
    fetchParaleloGestionDetalle,
    fetchParaleloGestionDetalleSilent,
    fetchOfertaCursos,
    fetchOfertaCursosSilent,
    crearOfertaCursoManual,
    eliminarOfertaCurso,
    fetchAulasCatalogo,
    fetchAulasCatalogoSilent,
  };
}
