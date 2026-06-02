import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, message } from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import {
  buildSetupKpis,
  filterParalelosGestionVisibles,
  gestionLabel,
  planCatalogoLabel,
  planTabLabel,
  planesCatalogoPendientesHabilitar,
  refreshCoberturaParalelos,
} from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaGestionPlanesState() {
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = Number(gestionIdParam);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notification } = App.useApp();

  const {
    loading: apiLoading,
    error: apiError,
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchPlanesVigentesCatalogo,
    fetchParalelosGestion,
    generarParalelosGestionSilent,
    habilitarPlan,
    fetchCoberturaDocente,
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);
  const paralelosFetchSeq = useRef(0);

  const [gestiones, setGestiones] = useState([]);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [planesHabilitadosLoaded, setPlanesHabilitadosLoaded] = useState(false);
  const [planesVigentes, setPlanesVigentes] = useState([]);
  const [paralelosByPlanId, setParalelosByPlanId] = useState({});
  const [coberturaByParaleloId, setCoberturaByParaleloId] = useState({});
  const [paralelosLoadingPlanId, setParalelosLoadingPlanId] = useState(null);
  const [generandoParalelos, setGenerandoParalelos] = useState(false);
  const [modalHabilitarPlan, setModalHabilitarPlan] = useState(false);

  const gestionSeleccionada = useMemo(
    () => gestiones.find((g) => Number(g.id) === gestionId) ?? null,
    [gestiones, gestionId]
  );

  const gestionVigente = useMemo(
    () => gestiones.find((g) => g.vigente) ?? null,
    [gestiones]
  );

  const esGestionOperativa = Boolean(gestionSeleccionada?.vigente);
  const sinPlanesHabilitados =
    planesHabilitadosLoaded && planesHabilitados.length === 0;
  const puedeHabilitarPlan = esGestionOperativa;
  const puedeEditarOferta = esGestionOperativa;

  const gestionContextAlert = useMemo(() => {
    if (!planesHabilitadosLoaded || !gestionSeleccionada) return null;

    const codigoActual = gestionLabel(gestionSeleccionada);
    const codigoVigente = gestionVigente ? gestionLabel(gestionVigente) : null;

    if (!esGestionOperativa) {
      if (sinPlanesHabilitados) {
        return {
          type: 'warning',
          message: 'Gestión histórica sin planes habilitados',
          description: codigoVigente
            ? `La gestión ${codigoActual} no tiene oferta configurada y no admite cambios. Vuelva a la gestión vigente (${codigoVigente}) para operar planes y paralelos.`
            : `La gestión ${codigoActual} no tiene oferta configurada y no admite cambios. Marque una gestión vigente para continuar.`,
          showIrGestionVigente: Boolean(gestionVigente),
        };
      }
      return {
        type: 'info',
        message: 'Gestión histórica (solo consulta)',
        description: codigoVigente
          ? `Los paralelos de ${codigoActual} son referencia histórica. Para habilitar planes o generar paralelos, use la gestión vigente (${codigoVigente}).`
          : `Los paralelos de ${codigoActual} son referencia histórica. Para operar la oferta, use la gestión vigente del instituto.`,
        showIrGestionVigente: Boolean(gestionVigente),
      };
    }

    if (sinPlanesHabilitados) {
      return {
        type: 'warning',
        message: 'Sin planes habilitados en la gestión',
        description:
          'Habilite al menos un plan de estudio vigente del catálogo académico para generar paralelos en esta gestión.',
        showHabilitarPlan: true,
      };
    }

    return null;
  }, [
    planesHabilitadosLoaded,
    gestionSeleccionada,
    esGestionOperativa,
    sinPlanesHabilitados,
    gestionVigente,
  ]);

  const activePlanKey = searchParams.get('plan');

  const planSeleccionado = useMemo(() => {
    if (!planesHabilitados.length) return null;
    const requested = activePlanKey != null ? Number(activePlanKey) : NaN;
    if (Number.isFinite(requested)) {
      const match = planesHabilitados.find((p) => Number(p.id) === requested);
      if (match) return match;
    }
    return planesHabilitados[0] ?? null;
  }, [planesHabilitados, activePlanKey]);

  const activePlanId = planSeleccionado?.id ?? null;

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

  const loadParalelosGestion = useCallback(async () => {
    if (!Number.isFinite(activePlanId) || activePlanId < 1) {
      return;
    }
    const seq = ++paralelosFetchSeq.current;
    setParalelosLoadingPlanId(activePlanId);
    try {
      const res = await fetchParalelosGestion(activePlanId);
      if (seq !== paralelosFetchSeq.current) return;
      const list = res.success ? (res.data?.paralelosGestion ?? []) : [];
      setParalelosByPlanId((prev) => ({ ...prev, [activePlanId]: list }));
      const visibles = filterParalelosGestionVisibles(list);
      const coberturas = await refreshCoberturaParalelos(fetchCoberturaDocente, visibles);
      if (seq !== paralelosFetchSeq.current) return;
      setCoberturaByParaleloId((prev) => ({ ...prev, ...coberturas }));
    } finally {
      if (seq === paralelosFetchSeq.current) {
        setParalelosLoadingPlanId(null);
      }
    }
  }, [fetchParalelosGestion, fetchCoberturaDocente, activePlanId]);

  const reloadParalelosTodosPlanes = useCallback(async () => {
    if (!planesHabilitados.length) return;
    const seq = ++paralelosFetchSeq.current;
    setParalelosLoadingPlanId(activePlanId ?? planesHabilitados[0]?.id ?? null);
    try {
      const nextByPlan = {};
      const nextCobertura = {};
      for (const plan of planesHabilitados) {
        const res = await fetchParalelosGestion(plan.id);
        if (seq !== paralelosFetchSeq.current) return;
        const list = res.success ? (res.data?.paralelosGestion ?? []) : [];
        nextByPlan[plan.id] = list;
        const visibles = filterParalelosGestionVisibles(list);
        const coberturas = await refreshCoberturaParalelos(fetchCoberturaDocente, visibles);
        if (seq !== paralelosFetchSeq.current) return;
        Object.assign(nextCobertura, coberturas);
      }
      setParalelosByPlanId((prev) => ({ ...prev, ...nextByPlan }));
      setCoberturaByParaleloId((prev) => ({ ...prev, ...nextCobertura }));
    } finally {
      if (seq === paralelosFetchSeq.current) {
        setParalelosLoadingPlanId(null);
      }
    }
  }, [
    planesHabilitados,
    activePlanId,
    fetchParalelosGestion,
    fetchCoberturaDocente,
  ]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  useEffect(() => {
    loadPlanesHabilitados();
  }, [loadPlanesHabilitados]);

  useEffect(() => {
    loadParalelosGestion();
  }, [loadParalelosGestion]);

  useEffect(() => {
    if (!esGestionOperativa) return;
    fetchPlanesVigentesCatalogo().then((res) => {
      if (!res.success) return;
      const raw = res.data?.planes_estudios ?? res.data;
      setPlanesVigentes(Array.isArray(raw) ? raw : []);
    });
  }, [esGestionOperativa, fetchPlanesVigentesCatalogo]);

  const planesPendientesHabilitar = useMemo(
    () => planesCatalogoPendientesHabilitar(planesVigentes, planesHabilitados),
    [planesVigentes, planesHabilitados]
  );

  const paralelosVisiblesByPlanId = useMemo(() => {
    const out = {};
    for (const [planId, list] of Object.entries(paralelosByPlanId)) {
      out[planId] = filterParalelosGestionVisibles(list);
    }
    return out;
  }, [paralelosByPlanId]);

  useEffect(() => {
    if (!planesHabilitadosLoaded || !planesHabilitados.length) return;
    const keys = planesHabilitados.map((p) => String(p.id));
    if (activePlanKey && keys.includes(activePlanKey)) return;
    setSearchParams({ plan: String(planesHabilitados[0].id) }, { replace: true });
  }, [planesHabilitados, planesHabilitadosLoaded, activePlanKey, setSearchParams]);

  const onTabChange = useCallback(
    (planId) => {
      setSearchParams({ plan: String(planId) }, { replace: true });
    },
    [setSearchParams]
  );

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
    if (!puedeHabilitarPlan) return;

    let catalogo = planesVigentes;
    if (!catalogo.length) {
      const res = await fetchPlanesVigentesCatalogo();
      if (res.success) {
        const raw = res.data?.planes_estudios ?? res.data;
        catalogo = Array.isArray(raw) ? raw : [];
        setPlanesVigentes(catalogo);
      }
    }

    const pendientes = planesCatalogoPendientesHabilitar(catalogo, planesHabilitados);
    if (!pendientes.length) {
      message.info('Todos los planes vigentes del catálogo ya están habilitados en esta gestión.');
      return;
    }
    if (pendientes.length === 1) {
      await onHabilitarPlan(pendientes[0].id);
      return;
    }
    setModalHabilitarPlan(true);
  }, [
    puedeHabilitarPlan,
    planesVigentes,
    planesHabilitados,
    fetchPlanesVigentesCatalogo,
    onHabilitarPlan,
  ]);

  const navigateGestionVigente = useCallback(() => {
    if (gestionVigente?.id) {
      navigate(ofertaPaths.gestionPlanes(gestionVigente.id));
    } else {
      navigate(ofertaPaths.dashboard());
    }
  }, [navigate, gestionVigente]);

  const onGenerarParalelos = useCallback(async () => {
    if (!puedeEditarOferta || !planesHabilitados.length) return;

    setGenerandoParalelos(true);
    let totalCreados = 0;
    let planesConAlta = 0;
    const errores = [];

    try {
      for (const plan of planesHabilitados) {
        const res = await generarParalelosGestionSilent(plan.id);
        if (!res.success) {
          errores.push(planTabLabel(plan));
          continue;
        }
        const resumen = res.data?.resumen;
        const creados =
          Number(resumen?.creados ?? 0) ||
          (Array.isArray(res.data?.paralelosGestion) ? res.data.paralelosGestion.length : 0);
        if (creados > 0) {
          totalCreados += creados;
          planesConAlta += 1;
        }
      }

      await reloadParalelosTodosPlanes();

      if (errores.length && !totalCreados) {
        notification.warning({
          message: 'No se generaron paralelos',
          description:
            'Revise plantillas en Configuración → Académico → Paralelos para las carreras de los planes habilitados.',
          duration: 8,
        });
        return;
      }

      if (totalCreados > 0) {
        notification.success({
          message: 'Paralelos de gestión generados',
          description:
            planesConAlta > 1
              ? `Se crearon ${totalCreados} paralelo(s) en ${planesConAlta} plan(es) habilitado(s).`
              : `Se crearon ${totalCreados} paralelo(s) en el plan habilitado.`,
        });
      } else {
        notification.success({
          message: 'Paralelos de gestión al día',
          description:
            'Todos los planes habilitados ya tenían instancias desde las plantillas del catálogo.',
        });
      }

      if (errores.length) {
        notification.warning({
          message: 'Algunos planes no se procesaron',
          description: errores.join(', '),
          duration: 8,
        });
      }
    } finally {
      setGenerandoParalelos(false);
    }
  }, [
    puedeEditarOferta,
    planesHabilitados,
    generarParalelosGestionSilent,
    reloadParalelosTodosPlanes,
    notification,
  ]);

  const onNavigateDetalle = useCallback(
    (paraleloGestionId) => {
      navigate(ofertaPaths.paraleloDetalle(paraleloGestionId));
    },
    [navigate]
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

  const pageTitle = 'Planes vigentes';

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Oferta Académica', href: ofertaPaths.dashboard() },
      { title: gestionSeleccionada ? gestionLabel(gestionSeleccionada) : 'Gestión' },
    ],
    [gestionSeleccionada]
  );

  const tabItems = useMemo(
    () =>
      planesHabilitados.map((plan) => ({
        key: String(plan.id),
        label: planTabLabel(plan),
        plan,
      })),
    [planesHabilitados]
  );

  return {
    gestionId,
    apiLoading: apiLoading || paralelosLoadingPlanId != null || generandoParalelos,
    planesLoading: apiLoading && !planesHabilitadosLoaded,
    paralelosLoadingPlanId,
    apiError,
    gestionSeleccionada,
    gestionVigente,
    esGestionOperativa,
    sinPlanesHabilitados,
    puedeHabilitarPlan,
    puedeEditarOferta,
    gestionContextAlert,
    planesHabilitados,
    planesHabilitadosLoaded,
    planesVigentes,
    planSeleccionado,
    activePlanKey: activePlanId != null ? String(activePlanId) : undefined,
    tabItems,
    paralelosByPlanId,
    paralelosVisiblesByPlanId,
    coberturaByParaleloId,
    generandoParalelos,
    planesPendientesHabilitar,
    planCatalogoLabel,
    modalHabilitarPlan,
    setModalHabilitarPlan,
    pageTitle,
    breadcrumbItems,
    kpis,
    onTabChange,
    onHabilitarPlan,
    openHabilitarPlanModal,
    onGenerarParalelos,
    onNavigateDetalle,
    navigateBack: () => navigate(ofertaPaths.dashboard()),
    navigateDashboard: () => navigate(ofertaPaths.dashboard()),
    navigateGestionVigente,
  };
}
