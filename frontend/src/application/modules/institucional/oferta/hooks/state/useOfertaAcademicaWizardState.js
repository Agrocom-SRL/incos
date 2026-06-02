import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

const TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

export function useOfertaAcademicaWizardState() {
  const {
    loading: apiLoading,
    error: apiError,
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
  } = useOfertaAcademicaApi();

  const planesFetchSeq = useRef(0);
  const paralelosFetchSeq = useRef(0);
  const [step, setStep] = useState(0);
  const [gestiones, setGestiones] = useState([]);
  const [selectedGestionId, setSelectedGestionId] = useState(null);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [planesHabilitadosLoaded, setPlanesHabilitadosLoaded] = useState(false);
  const [selectedGestionPlanId, setSelectedGestionPlanId] = useState(null);
  const [paralelosGestion, setParalelosGestion] = useState([]);
  const [validacionPorId, setValidacionPorId] = useState({});
  const [aulas, setAulas] = useState([]);
  const [planesVigentes, setPlanesVigentes] = useState([]);
  const [modalHabilitarPlan, setModalHabilitarPlan] = useState(false);
  const [drawerParaleloId, setDrawerParaleloId] = useState(null);
  const [drawerDetalle, setDrawerDetalle] = useState(null);
  const [drawerOfertaCursos, setDrawerOfertaCursos] = useState([]);

  const gestionSeleccionada = useMemo(
    () =>
      gestiones.find((g) => Number(g.id) === Number(selectedGestionId)) ??
      gestiones.find((g) => g.id === selectedGestionId) ??
      null,
    [gestiones, selectedGestionId]
  );

  const planSeleccionado = useMemo(
    () => planesHabilitados.find((p) => p.id === selectedGestionPlanId) ?? null,
    [planesHabilitados, selectedGestionPlanId]
  );

  /** Solo depende de validarOferta: incluir paralelosGestion recreaba loadParalelosGestion y el useEffect del paso 3 en bucle. */
  const refreshValidaciones = useCallback(async (items) => {
    const rows = Array.isArray(items) ? items : [];
    if (!rows.length) {
      setValidacionPorId({});
      return;
    }
    const entries = await Promise.all(
      rows.map(async (pg) => {
        const res = await validarOferta(pg.id);
        if (!res.success) return [pg.id, null];
        return [pg.id, res.data?.validacion ?? res.data];
      })
    );
    setValidacionPorId(Object.fromEntries(entries));
  }, [validarOferta]);

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    const list = Array.isArray(raw) ? raw : [];
    setGestiones(list);
    const vigente = list.find((g) => g.vigente);
    if (vigente) {
      const id = Number(vigente.id);
      const normalized = Number.isFinite(id) ? id : vigente.id;
      setSelectedGestionId((prev) => prev ?? normalized);
    }
  }, [fetchGestiones]);

  const loadPlanesHabilitados = useCallback(async () => {
    if (!selectedGestionId) {
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(false);
      return;
    }
    const seq = ++planesFetchSeq.current;
    setPlanesHabilitadosLoaded(false);
    const res = await fetchPlanesHabilitados(selectedGestionId);
    if (seq !== planesFetchSeq.current) return;
    if (!res.success) {
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(true);
      return;
    }
    setPlanesHabilitados(res.data?.planesHabilitados ?? []);
    setPlanesHabilitadosLoaded(true);
  }, [fetchPlanesHabilitados, selectedGestionId]);

  const loadParalelosGestion = useCallback(async () => {
    if (!selectedGestionPlanId) return;
    const seq = ++paralelosFetchSeq.current;
    const res = await fetchParalelosGestion(selectedGestionPlanId);
    if (seq !== paralelosFetchSeq.current) return;
    if (!res.success) return;
    const list = res.data?.paralelosGestion ?? [];
    setParalelosGestion(list);
    await refreshValidaciones(list);
  }, [fetchParalelosGestion, selectedGestionPlanId, refreshValidaciones]);

  const loadAulas = useCallback(async () => {
    const res = await fetchAulasCatalogo();
    if (!res.success) return;
    setAulas(res.data?.aulas ?? []);
  }, [fetchAulasCatalogo]);

  useEffect(() => {
    loadGestiones();
  }, [loadGestiones]);

  useEffect(() => {
    if (!selectedGestionId) {
      planesFetchSeq.current += 1;
      setPlanesHabilitados([]);
      setPlanesHabilitadosLoaded(false);
      return;
    }
    loadPlanesHabilitados();
  }, [selectedGestionId, loadPlanesHabilitados]);

  useEffect(() => {
    if (step >= 2 && selectedGestionPlanId) {
      loadParalelosGestion();
      loadAulas();
    }
  }, [step, selectedGestionPlanId, loadParalelosGestion, loadAulas]);

  const onMarcarVigente = useCallback(async () => {
    if (!selectedGestionId) return;
    const res = await marcarGestionVigente(selectedGestionId);
    if (res.success) {
      message.success('Gestión marcada como vigente');
      await loadGestiones();
    }
  }, [marcarGestionVigente, selectedGestionId, loadGestiones]);

  const onHabilitarPlan = useCallback(
    async (planEstudioId) => {
      if (!selectedGestionId || !planEstudioId) return;
      const res = await habilitarPlan({
        gestion_id: selectedGestionId,
        plan_estudio_id: planEstudioId,
      });
      if (res.success) {
        message.success('Plan habilitado en la gestión');
        setModalHabilitarPlan(false);
        await loadPlanesHabilitados();
      }
    },
    [habilitarPlan, selectedGestionId, loadPlanesHabilitados]
  );

  const openHabilitarPlanModal = useCallback(async () => {
    setModalHabilitarPlan(true);
    const res = await fetchPlanesVigentesCatalogo();
    if (res.success) {
      const raw = res.data?.planes_estudios ?? res.data;
      setPlanesVigentes(Array.isArray(raw) ? raw : []);
    }
  }, [fetchPlanesVigentesCatalogo]);

  const onGenerarParalelos = useCallback(async () => {
    if (!selectedGestionPlanId) return;
    const res = await generarParalelosGestion(selectedGestionPlanId);
    if (res.success) {
      message.success('Paralelos de gestión generados');
      await loadParalelosGestion();
      return;
    }
    message.warning(
      res.error ||
        'No se generaron paralelos de gestión. Revise que existan plantillas en Configuración → Académico → Paralelos (tab paralelos) para la carrera y periodos del plan.',
      8,
    );
  }, [generarParalelosGestion, selectedGestionPlanId, loadParalelosGestion]);

  const onGenerarOferta = useCallback(
    async (paraleloGestionId) => {
      const res = await generarOferta(paraleloGestionId);
      if (res.success) {
        message.success('Oferta de cursos generada');
        await loadParalelosGestion();
      }
    },
    [generarOferta, loadParalelosGestion]
  );

  const onUpdateAula = useCallback(
    async (paraleloGestionId, aulaId) => {
      const res = await updateParaleloGestion(paraleloGestionId, {
        aula_id: aulaId ?? null,
      });
      if (res.success) {
        await loadParalelosGestion();
      }
    },
    [updateParaleloGestion, loadParalelosGestion]
  );

  const onCambiarTurno = useCallback(
    async (paraleloGestionId, turno) => {
      const res = await cambiarTurnoParaleloGestion(paraleloGestionId, turno);
      if (res.success) {
        message.success('Turno actualizado');
        await loadParalelosGestion();
      }
    },
    [cambiarTurnoParaleloGestion, loadParalelosGestion]
  );

  const onPasarOfertado = useCallback(
    async (paraleloGestionId) => {
      const res = await updateParaleloGestionEstado(paraleloGestionId, 'OFERTADO');
      if (res.success) {
        message.success('Paralelo marcado como OFERTADO');
        await loadParalelosGestion();
      }
    },
    [updateParaleloGestionEstado, loadParalelosGestion]
  );

  const onPasarTodosOfertado = useCallback(async () => {
    for (const pg of paralelosGestion) {
      const v = validacionPorId[pg.id];
      if (!pg.aulaId || !v?.valido) continue;
      if (pg.estado !== 'BORRADOR') continue;
      await updateParaleloGestionEstado(pg.id, 'OFERTADO');
    }
    message.success('Proceso de cambio masivo finalizado');
    await loadParalelosGestion();
  }, [updateParaleloGestionEstado, paralelosGestion, validacionPorId, loadParalelosGestion]);

  const openDrawer = useCallback(
    async (paraleloGestionId) => {
      setDrawerParaleloId(paraleloGestionId);
      const [det, oferta] = await Promise.all([
        fetchParaleloGestionDetalle(paraleloGestionId),
        fetchOfertaCursos(paraleloGestionId),
      ]);
      if (det.success) {
        setDrawerDetalle(det.data?.paraleloGestion ?? det.data);
      }
      if (oferta.success) {
        setDrawerOfertaCursos(oferta.data?.ofertaCursos ?? []);
      }
    },
    [fetchParaleloGestionDetalle, fetchOfertaCursos]
  );

  const closeDrawer = useCallback(() => {
    setDrawerParaleloId(null);
    setDrawerDetalle(null);
    setDrawerOfertaCursos([]);
  }, []);

  const selectPlanYContinuar = useCallback((gestionPlanId) => {
    setSelectedGestionPlanId(gestionPlanId);
    setStep(2);
  }, []);

  const pageTitle = useMemo(() => {
    if (gestionSeleccionada) {
      const codigo =
        gestionSeleccionada.codigo ??
        gestionSeleccionada.name ??
        gestionSeleccionada.nombre ??
        `Gestión ${gestionSeleccionada.id}`;
      return `Oferta — ${codigo}${gestionSeleccionada.anio ? ` ${gestionSeleccionada.anio}` : ''}`;
    }
    return 'Oferta Académica';
  }, [gestionSeleccionada]);

  const kpis = useMemo(() => {
    if (step < 2) {
      const planesCount = planesHabilitados.length;
      const sinPlanesReal =
        planesHabilitadosLoaded && selectedGestionId && planesCount === 0 ? 1 : 0;
      return {
        phase: 'setup',
        total: planesCount,
        planesHabilitados: planesCount,
        planesHabilitadosLoaded,
        sinPlanes: sinPlanesReal,
        gestionVigente: gestionSeleccionada?.vigente ? 1 : 0,
      };
    }

    const total = paralelosGestion.length || 1;
    let sinAula = 0;
    let ofertaIncompleta = 0;
    let listosOfertado = 0;
    let ofertados = 0;
    let publicados = 0;

    for (const pg of paralelosGestion) {
      if (!pg.aulaId) sinAula += 1;
      const v = validacionPorId[pg.id];
      if (v && !v.valido) ofertaIncompleta += 1;
      const est = String(pg.estado || '').toUpperCase();
      if (est === 'OFERTADO') ofertados += 1;
      if (est === 'PUBLICADO') publicados += 1;
      if (est === 'BORRADOR' && pg.aulaId && v?.valido) listosOfertado += 1;
    }

    const avanceOferta = ofertados + publicados;

    return {
      phase: 'paralelos',
      total: paralelosGestion.length,
      sinAula,
      ofertaIncompleta,
      listosOfertado,
      ofertados,
      publicados,
      completosPct: total > 0 ? Math.round((avanceOferta / total) * 100) : 0,
    };
  }, [
    step,
    planesHabilitados.length,
    planesHabilitadosLoaded,
    selectedGestionId,
    gestionSeleccionada,
    paralelosGestion,
    validacionPorId,
  ]);

  const hayAlertas = useMemo(() => {
    if (step === 0) {
      return Boolean(selectedGestionId && !gestionSeleccionada?.vigente);
    }
    if (step === 1) {
      return Boolean(
        selectedGestionId && planesHabilitadosLoaded && planesHabilitados.length === 0
      );
    }
    return kpis.sinAula > 0 || kpis.ofertaIncompleta > 0;
  }, [
    step,
    selectedGestionId,
    gestionSeleccionada,
    planesHabilitados.length,
    planesHabilitadosLoaded,
    kpis,
  ]);

  const canGoToStep = useCallback(
    (targetStep) => {
      if (targetStep === 0) return true;
      if (targetStep === 1) return Boolean(selectedGestionId);
      if (targetStep === 2) return Boolean(selectedGestionPlanId);
      return false;
    },
    [selectedGestionId, selectedGestionPlanId]
  );

  const goToStep = useCallback(
    (targetStep) => {
      if (canGoToStep(targetStep)) {
        setStep(targetStep);
      }
    },
    [canGoToStep]
  );

  return {
    step,
    setStep,
    TURNOS,
    gestiones,
    selectedGestionId,
    setSelectedGestionId,
    gestionSeleccionada,
    planesHabilitados,
    planesHabilitadosLoaded,
    selectedGestionPlanId,
    planSeleccionado,
    paralelosGestion,
    validacionPorId,
    aulas,
    planesVigentes,
    modalHabilitarPlan,
    setModalHabilitarPlan,
    drawerParaleloId,
    drawerDetalle,
    drawerOfertaCursos,
    apiLoading,
    apiError,
    onMarcarVigente,
    onHabilitarPlan,
    openHabilitarPlanModal,
    onGenerarParalelos,
    onGenerarOferta,
    onUpdateAula,
    onCambiarTurno,
    onPasarOfertado,
    onPasarTodosOfertado,
    openDrawer,
    closeDrawer,
    selectPlanYContinuar,
    loadParalelosGestion,
    pageTitle,
    kpis,
    hayAlertas,
    canGoToStep,
    goToStep,
    crearOfertaCursoManual,
    eliminarOfertaCurso,
    updateParaleloGestion,
  };
}
