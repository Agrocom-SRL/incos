/**
 * Asignación académica — wizard por pasos (mismo patrón que InscripcionesNueva + WizardForm).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { App, Alert, Form } from 'antd';
import { bloquesToCourseSchedules } from '@docentes/utils/asignacionCursoHorariosToGrid';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
import docenteRepository from '@implementations/DocenteRepository';
import { createDocenteAsignacionAcademicaWizardSteps } from '@docentes/config';
import DocentesAsignacionPlanSection from '@docentes/components/organisms/DocentesAsignacionPlanSection';
import DocentesAsignacionPeriodoSection from '@docentes/components/organisms/DocentesAsignacionPeriodoSection';
import DocentesAsignacionParaleloSection from '@docentes/components/organisms/DocentesAsignacionParaleloSection';
import DocentesAsignacionCursoSection from '@docentes/components/organisms/DocentesAsignacionCursoSection';
import DocentesAsignacionConfirmarSection from '@docentes/components/organisms/DocentesAsignacionConfirmarSection';
import '@modules/seguridad/styles/seguridad.css';
import '@docentes/styles/docentes-asignacion-academica.css';

function toMinutes(hhmm) {
  if (hhmm == null || hhmm === '') return null;
  const m = String(hhmm).match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

const DocentesAsignacionAcademica = () => {
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

  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [errorPlanes, setErrorPlanes] = useState(null);
  const [gestionPlanId, setGestionPlanId] = useState(null);

  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [errorPeriodos, setErrorPeriodos] = useState(null);
  const [periodoId, setPeriodoId] = useState(null);

  const [paralelos, setParalelos] = useState([]);
  const [loadingParalelos, setLoadingParalelos] = useState(false);
  const [errorParalelos, setErrorParalelos] = useState(null);
  const [paraleloId, setParaleloId] = useState(null);

  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState(null);
  const [cursoId, setCursoId] = useState(null);

  const [submittingAsignacion, setSubmittingAsignacion] = useState(false);

  const [bloques, setBloques] = useState([]);
  const [horarioMeta, setHorarioMeta] = useState({ cursoCodigo: null, cursoColorHex: null, materiaNombre: null });
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(null);
  const wizardSteps = useMemo(() => createDocenteAsignacionAcademicaWizardSteps(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingPlanes(true);
      setErrorPlanes(null);
      const res = await docenteRepository.listarPlanesHabilitadosAsignacion({ page: 1, limit: 500 });
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string'
            ? res.error
            : res.error?.message || 'No se pudieron cargar los planes habilitados';
        setErrorPlanes(msg);
        setPlanes([]);
      } else {
        setPlanes(Array.isArray(res.data) ? res.data : []);
      }
      setLoadingPlanes(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editingAssignment || gestionPlanId) return;
    if (editingAssignment.gestionPlanId != null && Number.isFinite(Number(editingAssignment.gestionPlanId))) {
      setGestionPlanId(Number(editingAssignment.gestionPlanId));
      return;
    }
    if (editingAssignment.planHabilitado) {
      const plan = planes.find((p) => String(p.nombre || '').trim() === String(editingAssignment.planHabilitado).trim());
      if (plan?.id != null) setGestionPlanId(Number(plan.id));
    }
  }, [editingAssignment, planes, gestionPlanId]);

  const handleGestionPlanChange = useCallback((id) => {
    setGestionPlanId(id);
    setPeriodoId(null);
    setParaleloId(null);
    setCursoId(null);
    setPeriodos([]);
    setParalelos([]);
    setCursos([]);
    setErrorPeriodos(null);
    setErrorParalelos(null);
    setErrorCursos(null);
  }, []);

  useEffect(() => {
    if (!gestionPlanId) {
      setPeriodos([]);
      setPeriodoId(null);
      setParaleloId(null);
      setCursoId(null);
      setParalelos([]);
      setCursos([]);
      setErrorPeriodos(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingPeriodos(true);
      setErrorPeriodos(null);
      const res = await docenteRepository.listarPeriodosAsignacion({
        gestionPlanId,
        page: 1,
        limit: 100,
      });
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string'
            ? res.error
            : res.error?.message || 'No se pudieron cargar los periodos';
        setErrorPeriodos(msg);
        setPeriodos([]);
      } else {
        setPeriodos(Array.isArray(res.data) ? res.data : []);
      }
      setLoadingPeriodos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [gestionPlanId]);

  useEffect(() => {
    if (!editingAssignment || !gestionPlanId || periodoId || !periodos.length) return;
    if (editingAssignment.periodoId != null && Number.isFinite(Number(editingAssignment.periodoId))) {
      setPeriodoId(Number(editingAssignment.periodoId));
      return;
    }
    const periodNameTarget = editingAssignment.periodoMateriaPlan || editingAssignment.periodoParalelo;
    if (!periodNameTarget) return;
    const period = periodos.find((p) => String(p.nombre || '').trim() === String(periodNameTarget).trim());
    if (period?.id != null) setPeriodoId(Number(period.id));
  }, [editingAssignment, gestionPlanId, periodos, periodoId]);

  useEffect(() => {
    if (!gestionPlanId || !periodoId) {
      setParalelos([]);
      setParaleloId(null);
      setCursoId(null);
      setCursos([]);
      setErrorParalelos(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingParalelos(true);
      setErrorParalelos(null);
      const res = await docenteRepository.listarParalelosAsignacion({
        gestionPlanId,
        periodoId,
        page: 1,
        limit: 200,
      });
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string'
            ? res.error
            : res.error?.message || 'No se pudieron cargar los paralelos';
        setErrorParalelos(msg);
        setParalelos([]);
        setParaleloId(null);
        setCursoId(null);
        setCursos([]);
      } else {
        setParalelos(Array.isArray(res.data) ? res.data : []);
        setParaleloId(null);
        setCursoId(null);
        setCursos([]);
      }
      setLoadingParalelos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [gestionPlanId, periodoId]);

  useEffect(() => {
    if (!editingAssignment || !gestionPlanId || !periodoId || paraleloId || !paralelos.length) return;
    if (editingAssignment.paraleloId != null && Number.isFinite(Number(editingAssignment.paraleloId))) {
      setParaleloId(Number(editingAssignment.paraleloId));
      return;
    }
    const paralelo = paralelos.find((p) => {
      const sameName = String(p.nombre || '').trim() === String(editingAssignment.paralelo || '').trim();
      const sameTurno =
        !editingAssignment.turnoParalelo ||
        String(p.turno || '').trim().toUpperCase() === String(editingAssignment.turnoParalelo || '').trim().toUpperCase();
      return sameName && sameTurno;
    });
    if (paralelo?.id != null) setParaleloId(Number(paralelo.id));
  }, [editingAssignment, gestionPlanId, periodoId, paraleloId, paralelos]);

  useEffect(() => {
    if (!paraleloId) {
      setCursos([]);
      setCursoId(null);
      setErrorCursos(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingCursos(true);
      setErrorCursos(null);
      const res = await docenteRepository.listarCursosPorParaleloAsignacion({
        paraleloId,
        page: 1,
        limit: 500,
      });
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string'
            ? res.error
            : res.error?.message || 'No se pudieron cargar los cursos';
        setErrorCursos(msg);
        setCursos([]);
        setCursoId(null);
      } else {
        setCursos(Array.isArray(res.data) ? res.data : []);
        setCursoId(null);
      }
      setLoadingCursos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [paraleloId]);

  useEffect(() => {
    if (!editingAssignment || !paraleloId || cursoId || !cursos.length) return;
    if (editingAssignment.cursoId != null && Number.isFinite(Number(editingAssignment.cursoId))) {
      setCursoId(Number(editingAssignment.cursoId));
      return;
    }
    const course = cursos.find((c) => {
      const matchesCode =
        editingAssignment.cursoCodigo &&
        String(c.codigo || '').trim().toUpperCase() === String(editingAssignment.cursoCodigo).trim().toUpperCase();
      const matchesMateria =
        editingAssignment.materia &&
        String(c.materiaNombre || '').trim().toUpperCase() === String(editingAssignment.materia).trim().toUpperCase();
      const matchesSigla =
        editingAssignment.siglaMateria &&
        String(c.materiaSigla || '').trim().toUpperCase() === String(editingAssignment.siglaMateria).trim().toUpperCase();
      return matchesCode || matchesMateria || matchesSigla;
    });
    if (course?.id != null) setCursoId(Number(course.id));
  }, [editingAssignment, paraleloId, cursos, cursoId]);

  useEffect(() => {
    const curso = cursoId ? cursos.find((c) => Number(c.id) === Number(cursoId)) : null;
    setHorarioMeta({
      cursoCodigo: curso?.codigo ?? null,
      cursoColorHex: curso?.colorHex ?? curso?.color_hex ?? null,
      materiaNombre: curso?.materiaNombre ?? null,
    });
  }, [cursoId, cursos]);

  useEffect(() => {
    if (!cursoId) {
      setBloques([]);
      setErrorHorarios(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingHorarios(true);
      setErrorHorarios(null);
      const res = await docenteRepository.obtenerHorariosCursoAsignacion(cursoId);
      if (cancelled) return;
      if (!res.success) {
        const msg =
          typeof res.error === 'string'
            ? res.error
            : res.error?.message || 'No se pudieron cargar los horarios';
        setErrorHorarios(msg);
        setBloques([]);
      } else {
        const payload = res.data && typeof res.data === 'object' ? res.data : {};
        setBloques(Array.isArray(payload.bloques) ? payload.bloques : []);
        setHorarioMeta((prev) => ({
          ...prev,
          cursoCodigo: payload.cursoCodigo ?? prev.cursoCodigo ?? null,
          cursoColorHex: payload.cursoColorHex ?? payload.curso_color_hex ?? prev.cursoColorHex ?? null,
        }));
      }
      setLoadingHorarios(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cursoId]);

  const resumenPlanLabel = useMemo(() => {
    const p = planes.find((x) => Number(x.id) === Number(gestionPlanId));
    if (!p) return '';
    const parts = [p.nombre || 'Plan habilitado', p.planEstudioId != null ? `Plan est. ${p.planEstudioId}` : null].filter(
      Boolean
    );
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

  const courseSchedulesDesdeBloques = useMemo(
    () =>
      bloquesToCourseSchedules(
        bloques,
        horarioMeta.cursoCodigo,
        paraleloNombreParaHorario,
        horarioMeta.cursoColorHex
      ),
    [bloques, horarioMeta.cursoCodigo, horarioMeta.cursoColorHex, paraleloNombreParaHorario]
  );

  const cargaHorariaOpt = useMemo(() => {
    if (!cursoId) return null;
    const uniqueBlocks = new Map();
    for (const b of bloques || []) {
      const key = `${b.dia ?? ''}-${String(b.horaInicio ?? '')}-${String(b.horaFin ?? '')}-${String(
        b.ordenSecuencia ?? b.orden_secuencia ?? ''
      )}`;
      if (!uniqueBlocks.has(key)) uniqueBlocks.set(key, b);
    }
    if (!uniqueBlocks.size) return null;

    let totalMinutes = 0;
    for (const b of uniqueBlocks.values()) {
      const start = toMinutes(b.horaInicio);
      const end = toMinutes(b.horaFin);
      if (start != null && end != null && end > start) {
        totalMinutes += end - start;
      } else {
        // Fallback: bloque académico típico de 45 min.
        totalMinutes += 45;
      }
    }

    const academicHours = Math.round(totalMinutes / 45);
    return academicHours > 0 ? academicHours : null;
  }, [bloques, cursoId]);

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
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes', href: '/docentes/listar' },
      { title: 'Asignación académica' },
    ],
    []
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath.startsWith('/') ? returnListPath : '/docentes/listar', {
      state: { menuSidebarKey, gestionReturnPath },
    });
  }, [navigate, returnListPath, menuSidebarKey, gestionReturnPath]);

  const handleRegistrarAsignacion = useCallback(async () => {
    if (!docenteId) {
      message.warning('Necesitás un docente seleccionado para registrar la asignación.');
      return;
    }
    if (!gestionPlanId || !periodoId || !paraleloId || !cursoId) {
      message.warning('Completá plan, periodo, paralelo y curso antes de registrar.');
      return;
    }
    setSubmittingAsignacion(true);
    const body = {
      gestionPlanId,
      cursoId,
      docenteId,
    };
    if (cargaHorariaOpt != null && Number.isFinite(Number(cargaHorariaOpt))) {
      body.cargaHoraria = Number(cargaHorariaOpt);
    }
    const res = await docenteRepository.crearAsignacion(body);
    setSubmittingAsignacion(false);
    if (!res.success) {
      const msg =
        typeof res.error === 'string'
          ? res.error
          : res.error?.message || 'No se pudo registrar la asignación';
      message.error(msg);
      return;
    }
    message.success('Asignación registrada');
  }, [docenteId, gestionPlanId, periodoId, paraleloId, cursoId, cargaHorariaOpt, message]);

  const handleActualizarAsignacion = useCallback(async () => {
    if (!editingAssignmentId) return;
    if (!cursoId) {
      message.warning('Elegí un curso (materia) para actualizar la asignación.');
      return;
    }
    setSubmittingAsignacion(true);
    const payload = {
      cursoId,
    };
    if (docenteId) payload.docenteId = docenteId;
    if (cargaHorariaOpt != null && Number.isFinite(Number(cargaHorariaOpt))) {
      payload.cargaHoraria = Number(cargaHorariaOpt);
    }
    const res = await docenteRepository.actualizarAsignacion(editingAssignmentId, payload);
    setSubmittingAsignacion(false);
    if (!res.success) {
      const msg =
        typeof res.error === 'string'
          ? res.error
          : res.error?.message || 'No se pudo actualizar la asignación';
      message.error(msg);
      return;
    }
    message.success('Asignación actualizada');
    navigate(returnListPath.startsWith('/') ? returnListPath : '/docentes/listar', {
      state: { menuSidebarKey, gestionReturnPath },
    });
  }, [
    editingAssignmentId,
    cursoId,
    docenteId,
    cargaHorariaOpt,
    message,
    navigate,
    returnListPath,
    menuSidebarKey,
    gestionReturnPath,
  ]);

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
    if (editingAssignmentId) {
      await handleActualizarAsignacion();
      return;
    }
    await handleRegistrarAsignacion();
  }, [editingAssignmentId, handleActualizarAsignacion, handleRegistrarAsignacion]);

  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, _section, wizardForm) => {
      if (sectionKey !== 'panel') return null;
      switch (stepIndex) {
        case 0:
          return (
            <DocentesAsignacionPlanSection
              key="plan"
              form={wizardForm}
              planes={planes}
              gestionPlanId={gestionPlanId}
              onGestionPlanChange={handleGestionPlanChange}
              loadingPlanes={loadingPlanes}
              errorPlanes={errorPlanes}
            />
          );
        case 1:
          return (
            <DocentesAsignacionPeriodoSection
              key="periodo"
              periodos={periodos}
              loading={loadingPeriodos}
              error={errorPeriodos}
              selectedPeriodoId={periodoId}
              onSelectPeriodo={(id) => {
                setPeriodoId(id);
                setParaleloId(null);
                setCursoId(null);
                setParalelos([]);
                setCursos([]);
              }}
              disabled={!gestionPlanId}
            />
          );
        case 2:
          return (
            <DocentesAsignacionParaleloSection
              key="paralelo"
              periodoNombre={periodoNombreActual}
              paralelos={paralelos}
              loading={loadingParalelos}
              error={errorParalelos}
              selectedParaleloId={paraleloId}
              onSelectParalelo={(id) => {
                setParaleloId(id);
                setCursoId(null);
                setCursos([]);
              }}
              disabled={!gestionPlanId || !periodoId}
            />
          );
        case 3:
          return (
            <DocentesAsignacionCursoSection
              key="curso"
              cursos={cursos}
              loading={loadingCursos}
              error={errorCursos}
              selectedCursoId={cursoId}
              onSelectCurso={setCursoId}
              disabled={!paraleloId}
              paraleloNombre={paraleloNombreParaHorario}
              paraleloTurno={paraleloTurnoParaHorario}
              carreraNombre={carreraNombreActual}
            />
          );
        case 4:
          return (
            <DocentesAsignacionConfirmarSection
              key="confirmar"
              planLabel={resumenPlanLabel}
              periodoLabel={resumenPeriodoLabel}
              paraleloLabel={resumenParaleloLabel}
              cursoLabel={resumenCursoLabel}
              docenteId={docenteId}
              docenteNombre={docenteNombre}
              cargaHorariaOpt={cargaHorariaOpt}
              courseSchedulesPreview={courseSchedulesDesdeBloques}
              loadingHorariosPreview={loadingHorarios}
              errorHorariosPreview={errorHorarios}
            />
          );
        default:
          return null;
      }
    },
    [
      planes,
      gestionPlanId,
      handleGestionPlanChange,
      loadingPlanes,
      errorPlanes,
      periodos,
      loadingPeriodos,
      errorPeriodos,
      periodoId,
      periodoNombreActual,
      paraleloNombreParaHorario,
      paraleloTurnoParaHorario,
      carreraNombreActual,
      paralelos,
      loadingParalelos,
      errorParalelos,
      paraleloId,
      cursos,
      loadingCursos,
      errorCursos,
      cursoId,
      resumenPlanLabel,
      resumenPeriodoLabel,
      resumenParaleloLabel,
      resumenCursoLabel,
      docenteId,
      docenteNombre,
      cargaHorariaOpt,
      courseSchedulesDesdeBloques,
      loadingHorarios,
      errorHorarios,
    ]
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Asignación académica"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button variant="default" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
              Volver
            </Button>
          }
        />
      }
      sidebar={null}
    >
      <div className="daa-shell daa-page--wizard">
        {!docenteId && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Ningún docente preseleccionado"
            description={
              <>
                Elegí un docente desde la{' '}
                <Link to="/docentes/listar">lista de docentes</Link> (acción en la fila) o abrí esta pantalla desde la
                ficha del docente.
              </>
            }
          />
        )}

        <div className="daa-asignacion-wizard-wrap">
          <WizardForm
            key={editingAssignmentId ? `edit-${editingAssignmentId}` : 'create'}
            className="daa-asignacion-wizard"
            steps={wizardSteps}
            form={form}
            loading={submittingAsignacion}
            viewMode={false}
            resolveOptions={() => []}
            onFinish={handleWizardFinish}
            showSaveButton={false}
            renderSectionContent={renderSectionContent}
            onValidateBeforeNext={onValidateBeforeNext}
            initialStep={initialStep}
            finishLabel={editingAssignmentId ? 'Guardar cambios de asignación' : 'Registrar asignación'}
            nextLabel="Siguiente"
            prevLabel="Anterior"
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default DocentesAsignacionAcademica;
