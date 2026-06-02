import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { pasadasPaths } from '@application-institucional/pasadas';
import {
  buildParalelosKpis,
  buildSetupKpis,
  gestionLabel,
  refreshValidacionesParalelos,
} from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaAcademicaDashboardState() {
  const navigate = useNavigate();
  const {
    loading: apiLoading,
    error: apiError,
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchParalelosGestion,
    validarOferta,
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);
  const [gestiones, setGestiones] = useState([]);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [planesHabilitadosLoaded, setPlanesHabilitadosLoaded] = useState(false);
  const [paralelosAgregados, setParalelosAgregados] = useState([]);
  const [validacionPorId, setValidacionPorId] = useState({});
  const [loadingParalelos, setLoadingParalelos] = useState(false);

  const gestionVigente = useMemo(() => gestiones.find((g) => g.vigente) ?? null, [gestiones]);
  const gestionVigenteId = useMemo(() => {
    const id = gestionVigente?.id;
    if (id == null) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [gestionVigente]);

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    setGestiones(Array.isArray(raw) ? raw : []);
  }, [fetchGestiones]);

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
    const resPlanes = await fetchPlanesHabilitados(gestionVigenteId);
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
          const res = await fetchParalelosGestion(plan.id);
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
  }, [gestionVigenteId, fetchPlanesHabilitados, fetchParalelosGestion, validarOferta]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

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

  return {
    apiLoading: apiLoading || loadingParalelos,
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
  };
}
