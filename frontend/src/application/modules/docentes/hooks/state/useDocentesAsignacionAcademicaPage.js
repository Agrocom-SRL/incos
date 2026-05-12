import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import docenteRepository from '@implementations/DocenteRepository';
import { createDocenteAsignacionAcademicaWizardSteps } from '@docentes/config';
import { useDocentesAsignacionCatalogos } from './useDocentesAsignacionCatalogos';
import { useDocentesAsignacionHorario } from './useDocentesAsignacionHorario';

export const useDocentesAsignacionAcademicaPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const st = location.state ?? {};
  const [form] = Form.useForm();
  const editingAssignment = st.editAssignment && typeof st.editAssignment === 'object' ? st.editAssignment : null;
  const editingAssignmentId =
    editingAssignment?.id != null && Number.isFinite(Number(editingAssignment.id)) ? Number(editingAssignment.id) : null;

  const returnListPath = typeof st.returnListPath === 'string' && st.returnListPath ? st.returnListPath : '/docentes/listar';
  const gestionReturnPath =
    typeof st.gestionReturnPath === 'string' && st.gestionReturnPath ? st.gestionReturnPath : '/docentes/listar';
  const menuSidebarKey = st.menuSidebarKey ?? 'DOC-LIST';
  const docenteId = st.docenteId != null && Number.isFinite(Number(st.docenteId)) ? Number(st.docenteId) : null;
  const docenteNombre = typeof st.docenteNombre === 'string' && st.docenteNombre.trim() ? st.docenteNombre.trim() : null;
  const initialStep = editingAssignmentId ? 3 : 0;

  const [submittingAsignacion, setSubmittingAsignacion] = useState(false);
  const [existingAssignmentDialog, setExistingAssignmentDialog] = useState(null); // { docenteId, docenteNombre, asignacionId }

  const {
    planes,
    loadingPlanes,
    errorPlanes,
    gestionPlanId,
    handleGestionPlanChange,
    periodos,
    loadingPeriodos,
    errorPeriodos,
    periodoId,
    handleSelectPeriodo,
    paralelos,
    loadingParalelos,
    errorParalelos,
    paraleloId,
    handleSelectParalelo,
    cursos,
    loadingCursos,
    errorCursos,
    cursoId,
    setCursoId,
  } = useDocentesAsignacionCatalogos(editingAssignment);

  const resumenPlanLabel = useMemo(() => {
    const p = planes.find((x) => Number(x.id) === Number(gestionPlanId));
    if (!p) return '';
    const parts = [p.nombre || 'Plan habilitado', p.planEstudioId != null ? `Plan est. ${p.planEstudioId}` : null].filter(Boolean);
    return parts.join(' · ');
  }, [planes, gestionPlanId]);

  const periodoNombreActual = useMemo(() => {
    const p = periodos.find((x) => Number(x.id) === Number(periodoId));
    return p?.nombre ?? null;
  }, [periodos, periodoId]);

  const paraleloNombreParaHorario = useMemo(() => {
    const p = paralelos.find((x) => Number(x.id) === Number(paraleloId));
    return p?.nombre ?? null;
  }, [paralelos, paraleloId]);

  const paraleloTurnoParaHorario = useMemo(() => {
    const p = paralelos.find((x) => Number(x.id) === Number(paraleloId));
    return p?.turno ?? null;
  }, [paralelos, paraleloId]);

  const carreraNombreActual = useMemo(() => {
    const p = planes.find((x) => Number(x.id) === Number(gestionPlanId));
    return p?.carreraNombre ?? null;
  }, [planes, gestionPlanId]);

  const { loadingHorarios, errorHorarios, courseSchedulesDesdeBloques, cargaHorariaOpt } = useDocentesAsignacionHorario({
    cursoId,
    cursos,
    paraleloNombreParaHorario,
  });

  const resumenPeriodoLabel = useMemo(() => {
    const p = periodos.find((x) => Number(x.id) === Number(periodoId));
    if (!p) return '';
    return [p.nombre, p.numero != null ? `Año ${p.numero}` : null].filter(Boolean).join(' · ');
  }, [periodos, periodoId]);

  const resumenParaleloLabel = useMemo(() => {
    const p = paralelos.find((x) => Number(x.id) === Number(paraleloId));
    if (!p) return '';
    return [p.nombre, p.turno].filter(Boolean).join(' · ');
  }, [paralelos, paraleloId]);

  const resumenCursoLabel = useMemo(() => {
    if (!cursoId) return '';
    const c = cursos.find((x) => Number(x.id) === Number(cursoId));
    if (!c) return `Curso #${cursoId}`;
    return [c.materiaNombre || c.codigo, c.codigo && c.materiaNombre ? `(${c.codigo})` : null].filter(Boolean).join(' ');
  }, [cursoId, cursos]);

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Docentes', href: '/docentes/listar' }, { title: 'Asignación académica' }],
    []
  );

  const handleClearExistingAssignmentDialog = useCallback(() => {
    setExistingAssignmentDialog(null);
  }, []);

  const handleGoToExistingDocente = useCallback(() => {
    if (existingAssignmentDialog?.docenteId) {
      handleClearExistingAssignmentDialog();
      navigate(`/docentes/${existingAssignmentDialog.docenteId}/asignaciones`);
    }
  }, [existingAssignmentDialog, handleClearExistingAssignmentDialog, navigate]);

  const handleRegistrarAsignacion = useCallback(async () => {
    if (!docenteId) return message.warning('Necesitás un docente seleccionado para registrar la asignación.');
    if (!gestionPlanId || !periodoId || !paraleloId || !cursoId) {
      return message.warning('Completá plan, periodo, paralelo y curso antes de registrar.');
    }
    setSubmittingAsignacion(true);
    const body = { gestionPlanId, cursoId, docenteId };
    if (cargaHorariaOpt != null && Number.isFinite(Number(cargaHorariaOpt))) body.cargaHoraria = Number(cargaHorariaOpt);
    const res = await docenteRepository.crearAsignacion(body);
    setSubmittingAsignacion(false);
    if (!res.success) {
      const msg = typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudo registrar la asignación';
      // Verificar si es el error de asignación existente
      if (msg.includes('Ya existe una asignación vigente')) {
        // Consultar la asignación existente
        const existingRes = await docenteRepository.listarAsignaciones({
          cursoId,
          gestionPlanId,
          vigente: 'true'
        });
        if (existingRes.success && existingRes.data && existingRes.data.length > 0) {
          const existing = existingRes.data[0];
          let docenteNombreResuelto = 'Docente desconocido';
          if (existing.docenteId) {
            const docenteRes = await docenteRepository.obtenerPorId(existing.docenteId);
            if (docenteRes.success && docenteRes.data) {
              const profile = docenteRes.data.profile ?? docenteRes.data;
              docenteNombreResuelto = profile.nombreCompleto || `Docente #${existing.docenteId}`;
            }
          }
          setExistingAssignmentDialog({
            docenteId: existing.docenteId,
            docenteNombre: docenteNombreResuelto,
            asignacionId: existing.id,
          });
          return;
        }
      }
      message.error(msg);
      return;
    }
    message.success('Asignación registrada');
    navigate(returnListPath.startsWith('/') ? returnListPath : '/docentes/listar', { state: { menuSidebarKey, gestionReturnPath } });
  }, [docenteId, gestionPlanId, periodoId, paraleloId, cursoId, cargaHorariaOpt, message, navigate, returnListPath, menuSidebarKey, gestionReturnPath]);

  const handleActualizarAsignacion = useCallback(async () => {
    if (!editingAssignmentId) return;
    if (!cursoId) return message.warning('Elegí un curso (materia) para actualizar la asignación.');
    setSubmittingAsignacion(true);
    const payload = { cursoId };
    if (docenteId) payload.docenteId = docenteId;
    if (cargaHorariaOpt != null && Number.isFinite(Number(cargaHorariaOpt))) payload.cargaHoraria = Number(cargaHorariaOpt);
    const res = await docenteRepository.actualizarAsignacion(editingAssignmentId, payload);
    setSubmittingAsignacion(false);
    if (!res.success) {
      const msg = typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudo actualizar la asignación';
      message.error(msg);
      return;
    }
    message.success('Asignación actualizada');
    navigate(returnListPath.startsWith('/') ? returnListPath : '/docentes/listar', { state: { menuSidebarKey, gestionReturnPath } });
  }, [editingAssignmentId, cursoId, docenteId, cargaHorariaOpt, message, navigate, returnListPath, menuSidebarKey, gestionReturnPath]);

  const onValidateBeforeNext = useCallback(
    (stepNumber) =>
      new Promise((resolve, reject) => {
        if (stepNumber === 1 && !gestionPlanId) {
          message.error('Elegí un plan habilitado para continuar.');
          reject(new Error('plan'));
          return;
        }
        if (stepNumber === 2 && !periodoId) {
          message.error('Elegí un periodo del plan.');
          reject(new Error('periodo'));
          return;
        }
        if (stepNumber === 3 && !paraleloId) {
          message.error('Elegí un paralelo.');
          reject(new Error('paralelo'));
          return;
        }
        if (stepNumber === 4 && !cursoId) {
          message.error('Elegí un curso (materia).');
          reject(new Error('curso'));
          return;
        }
        resolve();
      }),
    [gestionPlanId, periodoId, paraleloId, cursoId, message]
  );

  const handleWizardFinish = useCallback(async () => {
    if (editingAssignmentId) return handleActualizarAsignacion();
    return handleRegistrarAsignacion();
  }, [editingAssignmentId, handleActualizarAsignacion, handleRegistrarAsignacion]);

  const wizardSteps = useMemo(() => createDocenteAsignacionAcademicaWizardSteps(), []);

  const handleVolver = useCallback(() => {
    navigate(returnListPath.startsWith('/') ? returnListPath : '/docentes/listar', {
      state: { menuSidebarKey, gestionReturnPath },
    });
  }, [navigate, returnListPath, menuSidebarKey, gestionReturnPath]);

  return {
    form,
    editingAssignmentId,
    initialStep,
    wizardSteps,
    submittingAsignacion,
    docenteId,
    docenteNombre,
    breadcrumbItems,
    handleVolver,
    onValidateBeforeNext,
    handleWizardFinish,
    planes,
    loadingPlanes,
    errorPlanes,
    gestionPlanId,
    handleGestionPlanChange,
    periodos,
    loadingPeriodos,
    errorPeriodos,
    periodoId,
    handleSelectPeriodo,
    periodoNombreActual,
    paralelos,
    loadingParalelos,
    errorParalelos,
    paraleloId,
    handleSelectParalelo,
    paraleloNombreParaHorario,
    paraleloTurnoParaHorario,
    carreraNombreActual,
    cursos,
    loadingCursos,
    errorCursos,
    cursoId,
    setCursoId,
    resumenPlanLabel,
    resumenPeriodoLabel,
    resumenParaleloLabel,
    resumenCursoLabel,
    cargaHorariaOpt,
    courseSchedulesDesdeBloques,
    loadingHorarios,
    errorHorarios,
    existingAssignmentDialog,
    handleClearExistingAssignmentDialog,
    handleGoToExistingDocente,
  };
};

