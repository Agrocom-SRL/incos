import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { pasadasPaths } from '@application-institucional/pasadas';
import { buildSetupKpis, gestionLabel } from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaGestionPlanesState() {
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = Number(gestionIdParam);
  const navigate = useNavigate();

  const {
    loading: apiLoading,
    error: apiError,
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchPlanesVigentesCatalogo,
    habilitarPlan,
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);
  const [gestiones, setGestiones] = useState([]);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [planesHabilitadosLoaded, setPlanesHabilitadosLoaded] = useState(false);
  const [planesVigentes, setPlanesVigentes] = useState([]);
  const [modalHabilitarPlan, setModalHabilitarPlan] = useState(false);

  const gestionSeleccionada = useMemo(
    () => gestiones.find((g) => Number(g.id) === gestionId) ?? null,
    [gestiones, gestionId]
  );

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    setGestiones(Array.isArray(raw) ? raw : []);
  }, [fetchGestiones]);

  const loadPlanesHabilitados = useCallback(async () => {
    if (!Number.isFinite(gestionId) || gestionId < 1) {
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(false);
      return;
    }
    const seq = ++planesFetchSeq.current;
    setPlanesHabilitadosLoaded(false);
    const res = await fetchPlanesHabilitados(gestionId);
    if (seq !== planesFetchSeq.current) return;
    if (!res.success) {
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(true);
      return;
    }
    setPlanesHabilitados(res.data?.planesHabilitados ?? []);
    setPlanesHabilitadosLoaded(true);
  }, [fetchPlanesHabilitados, gestionId]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  useEffect(() => {
    loadPlanesHabilitados();
  }, [loadPlanesHabilitados]);

  const onHabilitarPlan = useCallback(
    async (planEstudioId) => {
      if (!gestionId || !planEstudioId) return;
      const res = await habilitarPlan({
        gestion_id: gestionId,
        plan_estudio_id: planEstudioId,
      });
      if (res.success) {
        message.success('Plan habilitado en la gestión');
        setModalHabilitarPlan(false);
        await loadPlanesHabilitados();
      }
    },
    [habilitarPlan, gestionId, loadPlanesHabilitados]
  );

  const openHabilitarPlanModal = useCallback(async () => {
    setModalHabilitarPlan(true);
    const res = await fetchPlanesVigentesCatalogo();
    if (res.success) {
      const raw = res.data?.planes_estudios ?? res.data;
      setPlanesVigentes(Array.isArray(raw) ? raw : []);
    }
  }, [fetchPlanesVigentesCatalogo]);

  const onVerParalelos = useCallback(
    (gestionPlanId) => {
      navigate(ofertaPaths.paralelosGestion(gestionId, gestionPlanId));
    },
    [navigate, gestionId]
  );

  const kpis = useMemo(
    () =>
      buildSetupKpis({
        planesHabilitados,
        planesHabilitadosLoaded,
        gestionSeleccionada,
      }),
    [planesHabilitados, planesHabilitadosLoaded, gestionSeleccionada]
  );

  const pageTitle = gestionSeleccionada
    ? `Planes — ${gestionLabel(gestionSeleccionada)}`
    : 'Planes habilitados';

  return {
    gestionId,
    apiLoading,
    apiError,
    gestionSeleccionada,
    planesHabilitados,
    planesHabilitadosLoaded,
    planesVigentes,
    modalHabilitarPlan,
    setModalHabilitarPlan,
    pageTitle,
    kpis,
    onHabilitarPlan,
    openHabilitarPlanModal,
    onVerParalelos,
    navigateBack: () => navigate(pasadasPaths.list()),
    navigateDashboard: () => navigate(ofertaPaths.dashboard()),
  };
}
