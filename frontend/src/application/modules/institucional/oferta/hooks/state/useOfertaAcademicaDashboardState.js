import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { pasadasPaths } from '@application-institucional/pasadas';
import {
  buildParalelosKpis,
  buildSetupKpis,
  gestionLabel,
  habilitarTodosPlanesPendientesEnGestion,
  planesCatalogoPendientesHabilitar,
  refreshValidacionesParalelos,
} from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaAcademicaDashboardState() {
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const {
    loading: mutationLoading,
    error: apiError,
    fetchGestionesSilent,
    fetchPlanesHabilitados,
    fetchPlanesHabilitadosSilent,
    fetchPlanesVigentesCatalogo,
    fetchPlanesVigentesCatalogoSilent,
    fetchParalelosGestionSilent,
    habilitarPlan,
    validarOferta,
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);
  const [gestiones, setGestiones] = useState([]);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [planesHabilitadosLoaded, setPlanesHabilitadosLoaded] = useState(false);
  const [paralelosAgregados, setParalelosAgregados] = useState([]);
  const [validacionPorId, setValidacionPorId] = useState({});
  const [loadingParalelos, setLoadingParalelos] = useState(false);
  const [planesVigentes, setPlanesVigentes] = useState([]);
  const [habilitandoPlanes, setHabilitandoPlanes] = useState(false);

  const gestionVigente = useMemo(() => gestiones.find((g) => g.vigente) ?? null, [gestiones]);
  const gestionVigenteId = useMemo(() => {
    const id = gestionVigente?.id;
    if (id == null) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [gestionVigente]);

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestionesSilent();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    setGestiones(Array.isArray(raw) ? raw : []);
  }, [fetchGestionesSilent]);

  const loadPlanesYParalelos = useCallback(async () => {
    if (!gestionVigenteId) {
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(true);
      setParalelosAgregados([]);
      setValidacionPorId({});
      return;
    }

    const seq = ++planesFetchSeq.current;
    setPlanesHabilitadosLoaded(false);
    const resPlanes = await fetchPlanesHabilitadosSilent(gestionVigenteId);
    if (seq !== planesFetchSeq.current) return;

    if (!resPlanes.success) {
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(true);
      return;
    }

    const planes = resPlanes.data?.planesHabilitados ?? [];
    setPlanesHabilitados(planes);
    setPlanesHabilitadosLoaded(true);

    setLoadingParalelos(true);
    try {
      const listas = await Promise.all(
        planes.map(async (plan) => {
          const res = await fetchParalelosGestionSilent(plan.id);
          return res.success ? res.data?.paralelosGestion ?? [] : [];
        })
      );
      if (seq !== planesFetchSeq.current) return;

      const merged = listas.flat();
      setParalelosAgregados(merged);
      const validaciones = await refreshValidacionesParalelos(validarOferta, merged);
      if (seq !== planesFetchSeq.current) return;
      setValidacionPorId(validaciones);
    } finally {
      if (seq === planesFetchSeq.current) {
        setLoadingParalelos(false);
      }
    }
  }, [gestionVigenteId, fetchPlanesHabilitadosSilent, fetchParalelosGestionSilent, validarOferta]);

  /**
   * Catálogo de planes activos en segundo plano (sin loading global) — solo
   * para saber si queda alguno por habilitar y avisarlo junto al botón
   * "Habilitar planes vigentes"; no bloquea el resto del panel.
   */
  const loadPlanesVigentesCatalogo = useCallback(async () => {
    if (!gestionVigenteId) {
      setPlanesVigentes([]);
      return;
    }
    const res = await fetchPlanesVigentesCatalogoSilent();
    if (res.success) {
      const raw = res.data?.planes_estudios ?? res.data;
      setPlanesVigentes(Array.isArray(raw) ? raw : []);
    }
  }, [gestionVigenteId, fetchPlanesVigentesCatalogoSilent]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  useEffect(() => {
    loadPlanesVigentesCatalogo();
  }, [loadPlanesVigentesCatalogo]);

  useEffect(() => {
    loadPlanesYParalelos();
  }, [loadPlanesYParalelos]);

  const setupKpis = useMemo(
    () =>
      buildSetupKpis({
        planesHabilitados,
        planesHabilitadosLoaded,
        gestionSeleccionada: gestionVigente,
      }),
    [planesHabilitados, planesHabilitadosLoaded, gestionVigente]
  );

  const paralelosKpis = useMemo(
    () => buildParalelosKpis(paralelosAgregados, validacionPorId),
    [paralelosAgregados, validacionPorId]
  );

  const dashboardKpis = useMemo(
    () => ({
      gestionesActivas: gestiones.filter((g) => g.activo !== false).length,
      planesHabilitados: planesHabilitados.length,
      ofertados: paralelosKpis.ofertados ?? 0,
      publicados: paralelosKpis.publicados ?? 0,
      borrador: paralelosKpis.borrador ?? 0,
    }),
    [gestiones, planesHabilitados, paralelosKpis]
  );

  const pageTitle = gestionVigente
    ? `Oferta académica — ${gestionLabel(gestionVigente)}`
    : 'Oferta académica';

  const dashboardSidebarStats = useMemo(
    () => ({
      planesCount: planesHabilitados.length,
      paralelosTotal: paralelosAgregados.length,
      ofertados: dashboardKpis.ofertados,
      publicados: dashboardKpis.publicados,
      borrador: dashboardKpis.borrador,
    }),
    [planesHabilitados.length, paralelosAgregados.length, dashboardKpis]
  );

  const navigateGestiones = useCallback(() => navigate(pasadasPaths.list()), [navigate]);
  const navigatePlanesVigente = useCallback(() => {
    if (gestionVigenteId) navigate(ofertaPaths.gestionPlanes(gestionVigenteId));
  }, [navigate, gestionVigenteId]);
  const navigateParalelosPlan = useCallback(
    (gestionPlanId) => {
      if (gestionVigenteId) navigate(ofertaPaths.gestionPlanesConPlan(gestionVigenteId, gestionPlanId));
    },
    [navigate, gestionVigenteId]
  );
  const navigateHorarios = useCallback(() => navigate('/institucional/horarios'), [navigate]);
  const navigateRenovarOferta = useCallback(
    () => navigate(ofertaPaths.renovarOferta()),
    [navigate]
  );

  const sinPlanesHabilitados =
    Boolean(gestionVigente?.vigente) &&
    planesHabilitadosLoaded &&
    planesHabilitados.length === 0;

  /** Cuántos planes activos del catálogo todavía no están habilitados en la gestión vigente. */
  const planesPendientesCount = useMemo(
    () => planesCatalogoPendientesHabilitar(planesVigentes, planesHabilitados).length,
    [planesVigentes, planesHabilitados]
  );

  const onHabilitarTodosPlanes = useCallback(async () => {
    if (!gestionVigenteId || !gestionVigente?.vigente) {
      messageApi.info('Solo la gestión vigente admite habilitar planes desde el panel de oferta.');
      return;
    }

    setHabilitandoPlanes(true);
    try {
      const result = await habilitarTodosPlanesPendientesEnGestion({
        gestionId: gestionVigenteId,
        habilitarPlan,
        fetchPlanesHabilitados,
        fetchPlanesVigentesCatalogo,
        planesVigentes,
      });

      if (result.catalogo?.length) {
        setPlanesVigentes(result.catalogo);
      }

      if (result.yaCompletos) {
        messageApi.info('Todos los planes activos del catálogo ya están habilitados en esta gestión.');
        return;
      }

      if (!result.success && result.error) {
        messageApi.error(result.error);
        return;
      }

      if (result.habilitados > 0) {
        messageApi.success(
          result.errores.length
            ? `Se habilitaron ${result.habilitados} de ${result.total} planes. Revise los que no se vincularon.`
            : `Se habilitaron ${result.habilitados} planes en la gestión vigente.`
        );
        await loadPlanesYParalelos();
      } else if (result.errores.length) {
        messageApi.error('No se pudo habilitar ningún plan en la gestión.');
      }
    } finally {
      setHabilitandoPlanes(false);
    }
  }, [
    gestionVigenteId,
    gestionVigente,
    habilitarPlan,
    fetchPlanesHabilitados,
    fetchPlanesVigentesCatalogo,
    planesVigentes,
    messageApi,
    loadPlanesYParalelos,
  ]);

  // Botón único del panel una vez que ya hay planes habilitados: habilita
  // cualquier plan activo pendiente (históricos con estudiantes en curso
  // incluidos) y de una vez navega a "Planes vigentes" — antes eran dos
  // acciones separadas y la de habilitar quedaba perdida/mal ubicada.
  const onHabilitarPlanesVigentes = useCallback(async () => {
    await onHabilitarTodosPlanes();
    navigatePlanesVigente();
  }, [onHabilitarTodosPlanes, navigatePlanesVigente]);

  return {
    apiLoading: mutationLoading,
    loadingParalelos,
    apiError,
    gestiones,
    gestionVigente,
    planesHabilitados,
    dashboardKpis,
    setupKpis,
    dashboardSidebarStats,
    pageTitle,
    navigateGestiones,
    navigatePlanesVigente,
    navigateParalelosPlan,
    navigateHorarios,
    navigateRenovarOferta,
    sinPlanesHabilitados,
    planesPendientesCount,
    habilitandoPlanes,
    onHabilitarTodosPlanes,
    onHabilitarPlanesVigentes,
  };
}
