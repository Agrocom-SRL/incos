import { useCallback, useEffect, useMemo, useState } from 'react';
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';
import { normalizeCoberturaDocentePayload } from './ofertaStateShared.js';
import { buildAulasParaModalItems } from '../../utils/ofertaAulaModal.js';

export function useOfertaParaleloDetalleState() {
  const { paraleloGestionId: idParam } = useParams();
  const paraleloGestionId = Number(idParam);
  const navigate = useNavigate();
  const {
    loading: apiLoading,
    error: apiError,
    fetchParaleloGestionDetalle,
    fetchOfertaCursos,
    updateParaleloGestionEstado,
    updateParaleloGestion,
    validarOferta,
    fetchCoberturaDocente,
    fetchAulasCatalogo,
    fetchParalelosGestion,
  } = useOfertaAcademicaApi();

  const [detalle, setDetalle] = useState(null);
  const [ofertaCursos, setOfertaCursos] = useState([]);
  const [validacion, setValidacion] = useState(null);
  const [coberturaDocente, setCoberturaDocente] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [paralelosEnPlan, setParalelosEnPlan] = useState([]);
  const [aulaModalOpen, setAulaModalOpen] = useState(false);
  const [aulaModalDraftId, setAulaModalDraftId] = useState(null);
  const [guardandoAula, setGuardandoAula] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(paraleloGestionId) || paraleloGestionId < 1) return;
    const [det, oferta, val, cob] = await Promise.all([
      fetchParaleloGestionDetalle(paraleloGestionId),
      fetchOfertaCursos(paraleloGestionId),
      validarOferta(paraleloGestionId),
      fetchCoberturaDocente(paraleloGestionId),
    ]);
    if (det.success) {
      const pg = det.data?.paraleloGestion ?? det.data;
      setDetalle(pg);
      if (pg?.gestionPlanId) {
        const par = await fetchParalelosGestion(pg.gestionPlanId);
        if (par.success) {
          setParalelosEnPlan(par.data?.paralelosGestion ?? []);
        }
      } else {
        setParalelosEnPlan([]);
      }
    }
    if (oferta.success) setOfertaCursos(oferta.data?.ofertaCursos ?? []);
    if (val.success) setValidacion(val.data?.validacion ?? val.data);
    if (cob.success) {
      setCoberturaDocente(normalizeCoberturaDocentePayload(cob.data));
    }
  }, [
    fetchParaleloGestionDetalle,
    fetchOfertaCursos,
    validarOferta,
    fetchCoberturaDocente,
    fetchParalelosGestion,
    paraleloGestionId,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchAulasCatalogo();
      if (!cancelled && res.success) {
        const raw = res.data?.aulas ?? res.data;
        setAulas(Array.isArray(raw) ? raw : []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchAulasCatalogo]);

  const cargaHorariaResumen = useMemo(() => {
    const horasPlan = Number(validacion?.horas_total ?? 0);
    const materiasEsperadas = Number(validacion?.asignaturas_esperadas ?? 0);
    const materiasOfertadas = Number(validacion?.oferta_actual ?? ofertaCursos.length);
    const horasOfertadas = ofertaCursos.reduce(
      (sum, c) => sum + (Number(c.horasSemanales) || 0),
      0
    );
    const faltantes = Array.isArray(validacion?.faltantes) ? validacion.faltantes : [];
    return {
      horasPlan,
      horasOfertadas,
      materiasEsperadas,
      materiasOfertadas,
      faltantes,
      valido: Boolean(validacion?.valido),
      completo: validacion?.valido && horasPlan > 0 && horasOfertadas >= horasPlan,
    };
  }, [validacion, ofertaCursos]);

  const faltantesDocenteIds = useMemo(() => {
    const list = coberturaDocente?.faltantes ?? [];
    return new Set(
      list
        .map((f) => Number(f.oferta_curso_id ?? f.ofertaCursoId))
        .filter((id) => Number.isFinite(id) && id > 0)
    );
  }, [coberturaDocente]);

  const puedeEditarAula = useMemo(() => {
    const est = String(detalle?.estado ?? '').toUpperCase();
    return est === 'BORRADOR' || est === 'OFERTADO';
  }, [detalle?.estado]);

  const aulasModalItems = useMemo(
    () =>
      buildAulasParaModalItems({
        aulas,
        paralelosEnPlan,
        paraleloGestionId,
        aulaIdActual: detalle?.aulaId,
        detalle,
      }),
    [aulas, paralelosEnPlan, paraleloGestionId, detalle],
  );

  const openAulaModal = useCallback(() => {
    setAulaModalDraftId(detalle?.aulaId ?? null);
    setAulaModalOpen(true);
  }, [detalle?.aulaId]);

  const closeAulaModal = useCallback(() => {
    setAulaModalOpen(false);
  }, []);

  const onMarcarOfertado = useCallback(async () => {
    const res = await updateParaleloGestionEstado(paraleloGestionId, 'OFERTADO');
    if (res.success) {
      message.success('Paralelo marcado como OFERTADO');
      await load();
    } else if (res.error) {
      message.error(res.error);
    }
  }, [updateParaleloGestionEstado, paraleloGestionId, load]);

  const onConfirmarAulaModal = useCallback(async () => {
    if (!puedeEditarAula || aulaModalDraftId == null) return;
    setGuardandoAula(true);
    try {
      const res = await updateParaleloGestion(paraleloGestionId, {
        aula_id: aulaModalDraftId,
      });
      if (res.success) {
        message.success('Aula actualizada para el paralelo');
        setAulaModalOpen(false);
        await load();
      } else if (res.error) {
        message.error(res.error);
      }
    } finally {
      setGuardandoAula(false);
    }
  }, [
    puedeEditarAula,
    updateParaleloGestion,
    paraleloGestionId,
    aulaModalDraftId,
    load,
  ]);

  const returnPath = useMemo(() => {
    if (detalle?.gestionPlanId && detalle?.gestionId) {
      return ofertaPaths.gestionPlanesConPlan(detalle.gestionId, detalle.gestionPlanId);
    }
    return ofertaPaths.dashboard();
  }, [detalle]);

  const detallePath = useMemo(
    () => ofertaPaths.paraleloDetalle(paraleloGestionId),
    [paraleloGestionId]
  );

  const navigateBack = useCallback(() => navigate(returnPath), [navigate, returnPath]);

  const navigateHorariosArmado = useCallback(
    () => navigate(`/institucional/horarios/armado?pg=${paraleloGestionId}`),
    [navigate, paraleloGestionId]
  );

  const onNavigateAsignarDocente = useCallback(
    (curso) => {
      if (!detalle || !curso?.id) return;
      navigate('/docentes/asignar', {
        state: {
          asignacionPrefill: {
            gestionPlanId: detalle.gestionPlanId,
            periodoId: detalle.periodoId,
            paraleloId: detalle.paraleloId,
            cursoId: curso.id,
          },
          returnListPath: detallePath,
          gestionReturnPath: returnPath,
          menuSidebarKey: 'inst_oferta_academica',
        },
      });
    },
    [navigate, detalle, detallePath, returnPath]
  );

  const pageTitle = 'Oferta del paralelo';

  return {
    paraleloGestionId,
    apiLoading: apiLoading || guardandoAula,
    apiError,
    detalle,
    ofertaCursos,
    validacion,
    coberturaDocente,
    cargaHorariaResumen,
    faltantesDocenteIds,
    aulas,
    aulasModalItems,
    aulaModalOpen,
    aulaModalDraftId,
    setAulaModalDraftId,
    puedeEditarAula,
    guardandoAula,
    openAulaModal,
    closeAulaModal,
    onConfirmarAulaModal,
    pageTitle,
    onMarcarOfertado,
    load,
    navigateBack,
    navigateHorariosArmado,
    onNavigateAsignarDocente,
  };
}
