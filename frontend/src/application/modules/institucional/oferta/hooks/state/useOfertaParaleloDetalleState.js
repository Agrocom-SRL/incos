import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '../../config/paths.js';
import { buildHorariosArmadoUrl } from '@application-institucional/horarios/config/paths';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';
import { normalizeCoberturaDocentePayload } from './ofertaStateShared.js';
import { buildAulasParaModalItems } from '../../utils/ofertaAulaModal.js';

export function useOfertaParaleloDetalleState() {
  const { notification, modal } = App.useApp();
  const { paraleloGestionId: idParam } = useParams();
  const paraleloGestionId = Number(idParam);
  const navigate = useNavigate();
  const location = useLocation();
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
  const [docenteModalOpen, setDocenteModalOpen] = useState(false);
  const [docenteModalCurso, setDocenteModalCurso] = useState(null);

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

  const onMarcarOfertado = useCallback(() => {
    if (!detalle?.aulaId) {
      notification.warning({
        title: 'Aula requerida',
        description: 'Asigne un aula al paralelo antes de ofertarlo.',
      });
      return;
    }
    if (!cargaHorariaResumen.valido) {
      notification.warning({
        title: 'Oferta de cursos incompleta',
        description:
          'Genere o complete la oferta del periodo según el plan de estudio antes de ofertar el paralelo.',
      });
      return;
    }

    const docentesPendientes = faltantesDocenteIds.size;
    const descripcionDocente =
      docentesPendientes > 0
        ? `Quedan ${docentesPendientes} materia(s) sin docente; puede asignarlas desde esta tabla después. `
        : '';
    modal.confirm({
      title: 'Ofertar paralelo',
      content: `${descripcionDocente}Al ofertar el paralelo queda en estado OFERTADO y se habilita la matrícula. No exige docentes ni horarios publicados: eso se completa en asignación docente y Gestión de horarios.`,
      okText: 'Ofertar paralelo',
      cancelText: 'Cancelar',
      onOk: async () => {
        const res = await updateParaleloGestionEstado(paraleloGestionId, 'OFERTADO');
        if (res.success) {
          notification.success({
            title: 'Paralelo ofertado',
            description: 'El paralelo quedó en estado OFERTADO y listo para matrícula en esta gestión.',
          });
          await load();
        } else if (res.error) {
          notification.error({
            title: 'No se pudo actualizar el estado',
            description: String(res.error),
          });
        }
      },
    });
  }, [
    detalle?.aulaId,
    cargaHorariaResumen.valido,
    faltantesDocenteIds.size,
    modal,
    notification,
    updateParaleloGestionEstado,
    paraleloGestionId,
    load,
  ]);

  const onConfirmarAulaModal = useCallback(async () => {
    if (!puedeEditarAula || aulaModalDraftId == null) return;
    setGuardandoAula(true);
    try {
      const res = await updateParaleloGestion(paraleloGestionId, {
        aula_id: aulaModalDraftId,
      });
      if (res.success) {
        notification.success({
          title: 'Aula actualizada',
          description: 'El aula quedó asignada a este paralelo en la gestión.',
        });
        setAulaModalOpen(false);
        await load();
      } else if (res.error) {
        notification.error({
          title: 'No se pudo guardar el aula',
          description: String(res.error),
        });
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
    notification,
  ]);

  const docenteModalSelectedCourse = useMemo(() => {
    if (!docenteModalCurso || !detalle) return null;
    return {
      cursoId: Number(docenteModalCurso.id),
      gestionPlanId: detalle.gestionPlanId,
      gestionId: detalle.gestionId ?? null,
      materiaNombre: docenteModalCurso.materiaNombre,
      horasSemanales: docenteModalCurso.horasSemanales,
      horasSemanalesPlan: docenteModalCurso.horasSemanales,
      docenteId: docenteModalCurso.docenteId ?? null,
      docenteNombre: docenteModalCurso.docenteNombre ?? null,
      colorHex: docenteModalCurso.colorHex ?? null,
      cargaHoraria: docenteModalCurso.cargaHorariaAsignacion ?? null,
      fechaAsignacion: docenteModalCurso.fechaAsignacion ?? null,
    };
  }, [docenteModalCurso, detalle]);

  const openDocenteModal = useCallback(
    (curso) => {
      if (!curso?.id || !detalle) return;
      setDocenteModalCurso(curso);
      setDocenteModalOpen(true);
    },
    [detalle]
  );

  const closeDocenteModal = useCallback(() => {
    setDocenteModalOpen(false);
    setDocenteModalCurso(null);
  }, []);

  const onDocenteAsignado = useCallback(async () => {
    await load();
  }, [load]);

  const returnPath = useMemo(() => {
    const fromState = location.state?.returnListPath;
    if (typeof fromState === 'string' && fromState.trim()) {
      return fromState.trim();
    }
    if (detalle?.gestionPlanId && detalle?.gestionId) {
      return ofertaPaths.gestionPlanesConPlan(detalle.gestionId, detalle.gestionPlanId);
    }
    return ofertaPaths.dashboard();
  }, [detalle, location.state]);

  const navigateBack = useCallback(
    () =>
      navigate(returnPath, {
        state: location.state?.menuSidebarKey
          ? { menuSidebarKey: location.state.menuSidebarKey }
          : undefined,
      }),
    [navigate, returnPath, location.state],
  );

  const navigateHorariosArmado = useCallback(
    () => navigate(buildHorariosArmadoUrl(paraleloGestionId, { tab: 'plan' })),
    [navigate, paraleloGestionId]
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
    puedeMarcarOfertado:
      String(detalle?.estado ?? '').toUpperCase() === 'BORRADOR' &&
      Boolean(detalle?.aulaId) &&
      cargaHorariaResumen.valido &&
      ofertaCursos.length > 0,
    load,
    navigateBack,
    navigateHorariosArmado,
    docenteModalOpen,
    docenteModalSelectedCourse,
    docenteModalParaleloLabel: detalle?.paraleloNombre ?? null,
    openDocenteModal,
    closeDocenteModal,
    onDocenteAsignado,
  };
}
