import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

const TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

export function useOfertaAcademicaWizardState() {
  const api = useOfertaAcademicaApi();
  const [step, setStep] = useState(0);
  const [gestiones, setGestiones] = useState([]);
  const [selectedGestionId, setSelectedGestionId] = useState(null);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
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
    () => gestiones.find((g) => g.id === selectedGestionId) ?? null,
    [gestiones, selectedGestionId]
  );

  const planSeleccionado = useMemo(
    () => planesHabilitados.find((p) => p.id === selectedGestionPlanId) ?? null,
    [planesHabilitados, selectedGestionPlanId]
  );

  const refreshValidaciones = useCallback(
    async (items) => {
      const rows = items ?? paralelosGestion;
      if (!rows?.length) {
        setValidacionPorId({});
        return;
      }
      const entries = await Promise.all(
        rows.map(async (pg) => {
          const res = await api.validarOferta(pg.id);
          if (!res.success) return [pg.id, null];
          return [pg.id, res.data?.validacion ?? res.data];
        })
      );
      setValidacionPorId(Object.fromEntries(entries));
    },
    [api, paralelosGestion]
  );

  const loadGestiones = useCallback(async () => {
    const res = await api.fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    const list = Array.isArray(raw) ? raw : [];
    setGestiones(list);
    const vigente = list.find((g) => g.vigente);
    if (vigente && !selectedGestionId) {
      setSelectedGestionId(vigente.id);
    }
  }, [api, selectedGestionId]);

  const loadPlanesHabilitados = useCallback(async () => {
    if (!selectedGestionId) return;
    const res = await api.fetchPlanesHabilitados(selectedGestionId);
    if (!res.success) return;
    setPlanesHabilitados(res.data?.planesHabilitados ?? []);
  }, [api, selectedGestionId]);

  const loadParalelosGestion = useCallback(async () => {
    if (!selectedGestionPlanId) return;
    const res = await api.fetchParalelosGestion(selectedGestionPlanId);
    if (!res.success) return;
    const list = res.data?.paralelosGestion ?? [];
    setParalelosGestion(list);
    await refreshValidaciones(list);
  }, [api, selectedGestionPlanId, refreshValidaciones]);

  const loadAulas = useCallback(async () => {
    const res = await api.fetchAulasCatalogo();
    if (!res.success) return;
    setAulas(res.data?.aulas ?? []);
  }, [api]);

  useEffect(() => {
    loadGestiones();
  }, []);

  useEffect(() => {
    if (step >= 1 && selectedGestionId) {
      loadPlanesHabilitados();
    }
  }, [step, selectedGestionId]);

  useEffect(() => {
    if (step >= 2 && selectedGestionPlanId) {
      loadParalelosGestion();
      loadAulas();
    }
  }, [step, selectedGestionPlanId]);

  const onMarcarVigente = useCallback(async () => {
    if (!selectedGestionId) return;
    const res = await api.marcarGestionVigente(selectedGestionId);
    if (res.success) {
      message.success('Gestión marcada como vigente');
      await loadGestiones();
    }
  }, [api, selectedGestionId, loadGestiones]);

  const onHabilitarPlan = useCallback(
    async (planEstudioId) => {
      if (!selectedGestionId || !planEstudioId) return;
      const res = await api.habilitarPlan({
        gestion_id: selectedGestionId,
        plan_estudio_id: planEstudioId,
      });
      if (res.success) {
        message.success('Plan habilitado en la gestión');
        setModalHabilitarPlan(false);
        await loadPlanesHabilitados();
      }
    },
    [api, selectedGestionId, loadPlanesHabilitados]
  );

  const openHabilitarPlanModal = useCallback(async () => {
    setModalHabilitarPlan(true);
    const res = await api.fetchPlanesVigentesCatalogo();
    if (res.success) {
      const raw = res.data?.planes_estudios ?? res.data;
      setPlanesVigentes(Array.isArray(raw) ? raw : []);
    }
  }, [api]);

  const onGenerarParalelos = useCallback(async () => {
    if (!selectedGestionPlanId) return;
    const res = await api.generarParalelosGestion(selectedGestionPlanId);
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
  }, [api, selectedGestionPlanId, loadParalelosGestion]);

  const onGenerarOferta = useCallback(
    async (paraleloGestionId) => {
      const res = await api.generarOferta(paraleloGestionId);
      if (res.success) {
        message.success('Oferta de cursos generada');
        await loadParalelosGestion();
      }
    },
    [api, loadParalelosGestion]
  );

  const onUpdateAula = useCallback(
    async (paraleloGestionId, aulaId) => {
      const res = await api.updateParaleloGestion(paraleloGestionId, {
        aula_id: aulaId ?? null,
      });
      if (res.success) {
        await loadParalelosGestion();
      }
    },
    [api, loadParalelosGestion]
  );

  const onCambiarTurno = useCallback(
    async (paraleloGestionId, turno) => {
      const res = await api.cambiarTurnoParaleloGestion(paraleloGestionId, turno);
      if (res.success) {
        message.success('Turno actualizado');
        await loadParalelosGestion();
      }
    },
    [api, loadParalelosGestion]
  );

  const onPasarOfertado = useCallback(
    async (paraleloGestionId) => {
      const res = await api.updateParaleloGestionEstado(paraleloGestionId, 'OFERTADO');
      if (res.success) {
        message.success('Paralelo marcado como OFERTADO');
        await loadParalelosGestion();
      }
    },
    [api, loadParalelosGestion]
  );

  const onPasarTodosOfertado = useCallback(async () => {
    for (const pg of paralelosGestion) {
      const v = validacionPorId[pg.id];
      if (!pg.aulaId || !v?.valido) continue;
      if (pg.estado !== 'BORRADOR') continue;
      await api.updateParaleloGestionEstado(pg.id, 'OFERTADO');
    }
    message.success('Proceso de cambio masivo finalizado');
    await loadParalelosGestion();
  }, [api, paralelosGestion, validacionPorId, loadParalelosGestion]);

  const openDrawer = useCallback(
    async (paraleloGestionId) => {
      setDrawerParaleloId(paraleloGestionId);
      const [det, oferta] = await Promise.all([
        api.fetchParaleloGestionDetalle(paraleloGestionId),
        api.fetchOfertaCursos(paraleloGestionId),
      ]);
      if (det.success) {
        setDrawerDetalle(det.data?.paraleloGestion ?? det.data);
      }
      if (oferta.success) {
        setDrawerOfertaCursos(oferta.data?.ofertaCursos ?? []);
      }
    },
    [api]
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

  return {
    step,
    setStep,
    TURNOS,
    gestiones,
    selectedGestionId,
    setSelectedGestionId,
    gestionSeleccionada,
    planesHabilitados,
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
    apiLoading: api.loading,
    apiError: api.error,
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
    crearOfertaCursoManual: api.crearOfertaCursoManual,
    eliminarOfertaCurso: api.eliminarOfertaCurso,
    updateParaleloGestion: api.updateParaleloGestion,
  };
}
