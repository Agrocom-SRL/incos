import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import {
  buildParalelosKpis,
  gestionLabel,
  OFERTA_TURNOS,
  refreshValidacionesParalelos,
} from './ofertaStateShared.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

export function useOfertaParalelosGestionState() {
  const { gestionId: gestionIdParam, gestionPlanId: gestionPlanIdParam } = useParams();
  const gestionId = Number(gestionIdParam);
  const gestionPlanId = Number(gestionPlanIdParam);
  const navigate = useNavigate();

  const {
    loading: apiLoading,
    error: apiError,
    fetchGestiones,
    fetchPlanesHabilitados,
    fetchParalelosGestion,
    fetchAulasCatalogo,
    validarOferta,
    generarParalelosGestion,
    generarOferta,
    updateParaleloGestion,
    cambiarTurnoParaleloGestion,
    updateParaleloGestionEstado,
    fetchParaleloGestionDetalle,
    fetchOfertaCursos,
    crearOfertaCursoManual,
    eliminarOfertaCurso,
  } = useOfertaAcademicaApi();

  const paralelosFetchSeq = useRef(0);

  const [gestiones, setGestiones] = useState([]);
  const [planesHabilitados, setPlanesHabilitados] = useState([]);
  const [paralelosGestion, setParalelosGestion] = useState([]);
  const [validacionPorId, setValidacionPorId] = useState({});
  const [aulas, setAulas] = useState([]);
  const [filtroRapido, setFiltroRapido] = useState('todos');
  const [drawerParaleloId, setDrawerParaleloId] = useState(null);
  const [drawerDetalle, setDrawerDetalle] = useState(null);
  const [drawerOfertaCursos, setDrawerOfertaCursos] = useState([]);

  const gestionSeleccionada = useMemo(
    () => gestiones.find((g) => Number(g.id) === gestionId) ?? null,
    [gestiones, gestionId]
  );

  const planSeleccionado = useMemo(
    () => planesHabilitados.find((p) => Number(p.id) === gestionPlanId) ?? null,
    [planesHabilitados, gestionPlanId]
  );

  const loadGestiones = useCallback(async () => {
    const res = await fetchGestiones();
    if (!res.success) return;
    const raw = res.data?.gestiones ?? res.data?.managements ?? res.data;
    setGestiones(Array.isArray(raw) ? raw : []);
  }, [fetchGestiones]);

  const loadPlanes = useCallback(async () => {
    if (!Number.isFinite(gestionId) || gestionId < 1) return;
    const res = await fetchPlanesHabilitados(gestionId);
    if (res.success) {
      setPlanesHabilitados(res.data?.planesHabilitados ?? []);
    }
  }, [fetchPlanesHabilitados, gestionId]);

  const loadParalelosGestion = useCallback(async () => {
    if (!Number.isFinite(gestionPlanId) || gestionPlanId < 1) return;
    const seq = ++paralelosFetchSeq.current;
    const res = await fetchParalelosGestion(gestionPlanId);
    if (seq !== paralelosFetchSeq.current) return;
    if (!res.success) return;
    const list = res.data?.paralelosGestion ?? [];
    setParalelosGestion(list);
    const validaciones = await refreshValidacionesParalelos(validarOferta, list);
    if (seq !== paralelosFetchSeq.current) return;
    setValidacionPorId(validaciones);
  }, [fetchParalelosGestion, validarOferta, gestionPlanId]);

  const loadAulas = useCallback(async () => {
    const res = await fetchAulasCatalogo();
    if (res.success) setAulas(res.data?.aulas ?? []);
  }, [fetchAulasCatalogo]);

  useEffect(() => {
    loadGestiones();
    loadPlanes();
    loadAulas();
  }, [loadGestiones, loadPlanes, loadAulas]);

  useEffect(() => {
    loadParalelosGestion();
  }, [loadParalelosGestion]);

  const onGenerarParalelos = useCallback(async () => {
    const res = await generarParalelosGestion(gestionPlanId);
    if (res.success) {
      message.success('Paralelos de gestión generados');
      await loadParalelosGestion();
    } else {
      message.warning(
        res.error ||
          'No se generaron paralelos. Revise plantillas en Configuración → Académico → Paralelos.',
        8
      );
    }
  }, [generarParalelosGestion, gestionPlanId, loadParalelosGestion]);

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
      const res = await updateParaleloGestion(paraleloGestionId, { aula_id: aulaId ?? null });
      if (res.success) await loadParalelosGestion();
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
      if (det.success) setDrawerDetalle(det.data?.paraleloGestion ?? det.data);
      if (oferta.success) setDrawerOfertaCursos(oferta.data?.ofertaCursos ?? []);
    },
    [fetchParaleloGestionDetalle, fetchOfertaCursos]
  );

  const closeDrawer = useCallback(() => {
    setDrawerParaleloId(null);
    setDrawerDetalle(null);
    setDrawerOfertaCursos([]);
  }, []);

  const onNavigateDetalle = useCallback(
    (paraleloGestionId) => {
      navigate(ofertaPaths.paraleloDetalle(paraleloGestionId));
    },
    [navigate]
  );

  const kpis = useMemo(
    () => buildParalelosKpis(paralelosGestion, validacionPorId),
    [paralelosGestion, validacionPorId]
  );

  const paralelosFiltrados = useMemo(() => {
    if (filtroRapido === 'todos') return paralelosGestion;
    if (filtroRapido === 'pendientes') {
      return paralelosGestion.filter((pg) => String(pg.estado).toUpperCase() === 'BORRADOR');
    }
    if (filtroRapido === 'listos') {
      return paralelosGestion.filter((pg) => {
        const est = String(pg.estado).toUpperCase();
        return est === 'OFERTADO' || est === 'PUBLICADO';
      });
    }
    if (filtroRapido === 'sin_docente') {
      return paralelosGestion.filter((pg) => {
        const v = validacionPorId[pg.id];
        return v && Number(v.oferta_actual ?? 0) > 0 && !v.valido;
      });
    }
    return paralelosGestion;
  }, [paralelosGestion, filtroRapido, validacionPorId]);

  const pageTitle = planSeleccionado
    ? `Paralelos — ${planSeleccionado.carreraNombre ?? planSeleccionado.nombre ?? `Plan #${planSeleccionado.planEstudioId}`}`
    : 'Paralelos de gestión';

  const navigateBack = useCallback(
    () => navigate(ofertaPaths.gestionPlanes(gestionId)),
    [navigate, gestionId]
  );
  const navigateDashboard = useCallback(() => navigate(ofertaPaths.dashboard()), [navigate]);

  return {
    TURNOS: OFERTA_TURNOS,
    gestionId,
    gestionPlanId,
    apiLoading,
    apiError,
    gestionSeleccionada,
    planSeleccionado,
    paralelosGestion: paralelosFiltrados,
    paralelosGestionAll: paralelosGestion,
    validacionPorId,
    aulas,
    filtroRapido,
    setFiltroRapido,
    drawerParaleloId,
    drawerDetalle,
    drawerOfertaCursos,
    kpis,
    pageTitle,
    gestionLabel,
    onGenerarParalelos,
    onGenerarOferta,
    onUpdateAula,
    onCambiarTurno,
    onPasarOfertado,
    onPasarTodosOfertado,
    openDrawer,
    closeDrawer,
    onNavigateDetalle,
    loadParalelosGestion,
    crearOfertaCursoManual,
    eliminarOfertaCurso,
    updateParaleloGestion,
    navigateBack,
    navigateDashboard,
  };
}
