import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App, message } from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import {
  buildSetupKpis,
  gestionLabel,
  paralelosSinOfertaCursos,
  planTabLabel,
  refreshCoberturaParalelos,
} from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaGestionPlanesState() {
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = Number(gestionIdParam);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modal, notification } = App.useApp();

  const {
    loading: apiLoading,
    error: apiError,
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchParalelosGestion,
    generarParalelosGestionSilent,
    generarOfertaSilent,
    fetchCoberturaDocente,
    updateParaleloGestionEstado,
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);
  const paralelosFetchSeq = useRef(0);

  const [gestiones, setGestiones] = useState([]);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [planesHabilitadosLoaded, setPlanesHabilitadosLoaded] = useState(false);
  const [paralelosByPlanId, setParalelosByPlanId] = useState({});
  const [coberturaByParaleloId, setCoberturaByParaleloId] = useState({});
  const [paralelosLoadingPlanId, setParalelosLoadingPlanId] = useState(null);
  const [generandoParalelos, setGenerandoParalelos] = useState(false);
  const [inhabilitandoParaleloId, setInhabilitandoParaleloId] = useState(null);

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
      const coberturas = await refreshCoberturaParalelos(fetchCoberturaDocente, list);
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
        const coberturas = await refreshCoberturaParalelos(fetchCoberturaDocente, list);
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
    if (!planesHabilitadosLoaded || !esGestionOperativa) return;
    if (sinPlanesHabilitados) {
      navigate(ofertaPaths.dashboard(), { replace: true });
    }
  }, [planesHabilitadosLoaded, esGestionOperativa, sinPlanesHabilitados, navigate]);

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

  const navigateGestionVigente = useCallback(() => {
    if (gestionVigente?.id) {
      navigate(ofertaPaths.gestionPlanes(gestionVigente.id));
    } else {
      navigate(ofertaPaths.dashboard());
    }
  }, [navigate, gestionVigente]);

  const refreshParalelosPlan = useCallback(
    async (gestionPlanId) => {
      if (!Number.isFinite(gestionPlanId) || gestionPlanId < 1) return;
      const seq = ++paralelosFetchSeq.current;
      const res = await fetchParalelosGestion(gestionPlanId);
      if (seq !== paralelosFetchSeq.current || !res.success) return;
      const refreshed = res.data?.paralelosGestion ?? [];
      setParalelosByPlanId((prev) => ({ ...prev, [gestionPlanId]: refreshed }));
      const coberturas = await refreshCoberturaParalelos(fetchCoberturaDocente, refreshed);
      if (seq === paralelosFetchSeq.current) {
        setCoberturaByParaleloId((prev) => ({ ...prev, ...coberturas }));
      }
    },
    [fetchParalelosGestion, fetchCoberturaDocente]
  );

  const generarOfertaCursosEnPlan = useCallback(
    async (gestionPlanId, paralelosLista) => {
      const pendientes = paralelosSinOfertaCursos(paralelosLista);
      if (!pendientes.length) {
        return { totalCursos: 0, paralelosOk: 0, errores: [] };
      }

      let totalCursos = 0;
      let paralelosOk = 0;
      const errores = [];

      for (const pg of pendientes) {
        const res = await generarOfertaSilent(pg.id);
        if (!res.success) {
          errores.push(pg.paraleloNombre ?? `Paralelo #${pg.id}`);
          continue;
        }
        const creados = Number(res.data?.resumen?.creados ?? 0);
        if (creados > 0) {
          totalCursos += creados;
          paralelosOk += 1;
        }
      }

      await refreshParalelosPlan(gestionPlanId);
      return { totalCursos, paralelosOk, errores };
    },
    [generarOfertaSilent, refreshParalelosPlan]
  );

  const onGenerarParalelos = useCallback(async () => {
    if (!puedeEditarOferta || !planesHabilitados.length) return;

    setGenerandoParalelos(true);
    let totalParalelosCreados = 0;
    let planesConParalelosNuevos = 0;
    let totalCursos = 0;
    let paralelosConOferta = 0;
    const erroresPlanes = [];
    const erroresOferta = [];

    try {
      for (const plan of planesHabilitados) {
        const res = await generarParalelosGestionSilent(plan.id);
        if (!res.success) {
          erroresPlanes.push(planTabLabel(plan));
          continue;
        }
        const resumen = res.data?.resumen;
        const creados =
          Number(resumen?.creados ?? 0) ||
          (Array.isArray(res.data?.paralelosGestion) ? res.data.paralelosGestion.length : 0);
        if (creados > 0) {
          totalParalelosCreados += creados;
          planesConParalelosNuevos += 1;
        }

        const listaRes = await fetchParalelosGestion(plan.id);
        const lista = listaRes.success ? (listaRes.data?.paralelosGestion ?? []) : [];
        if (lista.length) {
          setParalelosByPlanId((prev) => ({ ...prev, [plan.id]: lista }));
        }

        const ofertaRes = await generarOfertaCursosEnPlan(plan.id, lista);
        totalCursos += ofertaRes.totalCursos;
        paralelosConOferta += ofertaRes.paralelosOk;
        if (ofertaRes.errores.length) {
          erroresOferta.push(...ofertaRes.errores);
        }
      }

      if (erroresPlanes.length && !totalParalelosCreados && !totalCursos) {
        notification.warning({
          message: 'No se generó la oferta',
          description:
            'Revise plantillas en Configuración → Académico → Paralelos y asignaturas del plan de estudio.',
          duration: 8,
        });
        return;
      }

      const partes = [];
      if (totalParalelosCreados > 0) {
        partes.push(
          planesConParalelosNuevos > 1
            ? `${totalParalelosCreados} paralelo(s) nuevos en ${planesConParalelosNuevos} planes`
            : `${totalParalelosCreados} paralelo(s) nuevos`
        );
      }
      if (totalCursos > 0) {
        partes.push(
          `${totalCursos} curso(s) en ${paralelosConOferta} paralelo${paralelosConOferta === 1 ? '' : 's'}`
        );
      }

      if (partes.length) {
        notification.success({
          message: 'Oferta preparada en la gestión',
          description: `${partes.join('. ')}.`,
        });
      } else {
        notification.success({
          message: 'Oferta al día',
          description:
            'Los paralelos y las materias del periodo ya estaban generados en todos los planes habilitados.',
        });
      }

      if (erroresPlanes.length || erroresOferta.length) {
        const detalle = [...new Set([...erroresPlanes, ...erroresOferta])].join(', ');
        notification.warning({
          message: 'Algunos ítems no se procesaron',
          description: detalle,
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
    fetchParalelosGestion,
    generarOfertaCursosEnPlan,
    notification,
  ]);

  const actualizarEstadoParalelo = useCallback(
    async (paraleloId, gestionPlanId, estado, mensajeExito) => {
      setInhabilitandoParaleloId(paraleloId);
      try {
        const res = await updateParaleloGestionEstado(paraleloId, estado);
        if (res.success) {
          message.success(mensajeExito);
          if (gestionPlanId) {
            await refreshParalelosPlan(gestionPlanId);
          } else {
            await reloadParalelosTodosPlanes();
          }
        } else if (res.error) {
          message.error(res.error);
        }
      } finally {
        setInhabilitandoParaleloId(null);
      }
    },
    [updateParaleloGestionEstado, refreshParalelosPlan, reloadParalelosTodosPlanes]
  );

  const onInhabilitarParalelo = useCallback(
    (paraleloId, gestionPlanId, paraleloNombre) => {
      if (!puedeEditarOferta || !paraleloId) return;

      modal.confirm({
        title: 'Inhabilitar oferta del paralelo',
        content: `¿Cerrar la oferta de ${paraleloNombre ?? 'este paralelo'} en la gestión? El paralelo quedará en estado CERRADO.`,
        okText: 'Inhabilitar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: () =>
          actualizarEstadoParalelo(
            paraleloId,
            gestionPlanId,
            'CERRADO',
            'Oferta del paralelo inhabilitada'
          ),
      });
    },
    [puedeEditarOferta, modal, actualizarEstadoParalelo]
  );

  const onHabilitarParalelo = useCallback(
    (paraleloId, gestionPlanId, paraleloNombre) => {
      if (!puedeEditarOferta || !paraleloId) return;

      modal.confirm({
        title: 'Habilitar paralelo en la gestión',
        content: `¿Reactivar ${paraleloNombre ?? 'este paralelo'}? Volverá a estado BORRADOR con su oferta de cursos y datos asociados.`,
        okText: 'Habilitar',
        cancelText: 'Cancelar',
        onOk: () =>
          actualizarEstadoParalelo(
            paraleloId,
            gestionPlanId,
            'BORRADOR',
            'Paralelo habilitado en la gestión'
          ),
      });
    },
    [puedeEditarOferta, modal, actualizarEstadoParalelo]
  );

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
    apiLoading:
      apiLoading ||
      paralelosLoadingPlanId != null ||
      generandoParalelos ||
      inhabilitandoParaleloId != null,
    planesLoading: apiLoading && !planesHabilitadosLoaded,
    paralelosLoadingPlanId,
    apiError,
    gestionSeleccionada,
    gestionVigente,
    esGestionOperativa,
    sinPlanesHabilitados,
    puedeEditarOferta,
    gestionContextAlert,
    planesHabilitados,
    planesHabilitadosLoaded,
    planSeleccionado,
    activePlanKey: activePlanId != null ? String(activePlanId) : undefined,
    tabItems,
    paralelosByPlanId,
    coberturaByParaleloId,
    generandoParalelos,
    inhabilitandoParaleloId,
    pageTitle,
    breadcrumbItems,
    kpis,
    onTabChange,
    onGenerarParalelos,
    onInhabilitarParalelo,
    onHabilitarParalelo,
    onNavigateDetalle,
    navigateBack: () => navigate(ofertaPaths.dashboard()),
    navigateDashboard: () => navigate(ofertaPaths.dashboard()),
    navigateGestionVigente,
  };
}
