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

const asignacionesColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 72 },
  { title: 'Plan hab.', dataIndex: 'gestionPlanId', key: 'gestionPlanId', width: 88 },
  { title: 'Curso', dataIndex: 'cursoId', key: 'cursoId', width: 88 },
  { title: 'Carga h.', dataIndex: 'cargaHoraria', key: 'cargaHoraria', width: 90, render: (v) => v ?? '—' },
  {
    title: 'Vigente',
    dataIndex: 'vigente',
    key: 'vigente',
    width: 80,
    render: (v) => (v ? 'Sí' : 'No'),
  },
  { title: 'Desde', dataIndex: 'fechaAsignacion', key: 'fechaAsignacion', ellipsis: true },
];

const DocentesAsignacionAcademica = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const st = location.state ?? {};
  const [form] = Form.useForm();

  const returnListPath = typeof st.returnListPath === 'string' && st.returnListPath ? st.returnListPath : '/docentes/listar';
  const menuSidebarKey = st.menuSidebarKey ?? 'DOC-LIST';
  const docenteId = st.docenteId != null && Number.isFinite(Number(st.docenteId)) ? Number(st.docenteId) : null;
  const docenteNombre = typeof st.docenteNombre === 'string' && st.docenteNombre.trim() ? st.docenteNombre.trim() : null;

  const [asignaciones, setAsignaciones] = useState([]);
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);
  const [errorAsignaciones, setErrorAsignaciones] = useState(null);

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
  const [cargaHorariaOpt, setCargaHorariaOpt] = useState(null);

  const [bloques, setBloques] = useState([]);
  const [horarioMeta, setHorarioMeta] = useState({ cursoCodigo: null, materiaNombre: null });
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(null);

  const wizardSteps = useMemo(() => createDocenteAsignacionAcademicaWizardSteps(), []);

  const reloadAsignaciones = useCallback(async () => {
    if (!docenteId) {
      setAsignaciones([]);
      setErrorAsignaciones(null);
      return;
    }
    setLoadingAsignaciones(true);
    setErrorAsignaciones(null);
    const res = await docenteRepository.listarAsignaciones({ docenteId, page: 1, limit: 500 });
    if (!res.success) {
      const msg =
        typeof res.error === 'string'
          ? res.error
          : res.error?.message || 'No se pudieron cargar las asignaciones';
      setErrorAsignaciones(msg);
      setAsignaciones([]);
    } else {
      setAsignaciones(Array.isArray(res.data) ? res.data : []);
    }
    setLoadingAsignaciones(false);
  }, [docenteId]);

  useEffect(() => {
    reloadAsignaciones();
  }, [reloadAsignaciones]);

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
    const curso = cursoId ? cursos.find((c) => Number(c.id) === Number(cursoId)) : null;
    setHorarioMeta({
      cursoCodigo: curso?.codigo ?? null,
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

  const courseSchedulesDesdeBloques = useMemo(
    () => bloquesToCourseSchedules(bloques, horarioMeta.cursoCodigo, paraleloNombreParaHorario),
    [bloques, horarioMeta.cursoCodigo, paraleloNombreParaHorario]
  );

  const previewAssignment = useMemo(() => {
    if (!cursoId) return null;
    const c = cursos.find((x) => Number(x.id) === Number(cursoId));
    const par = paralelos.find((x) => Number(x.id) === Number(paraleloId));
    const per = periodos.find((x) => Number(x.id) === Number(periodoId));
    return {
      vigente: true,
      materia: c?.materiaNombre ?? '—',
      siglaMateria: c?.materiaSigla ?? '—',
      paralelo: par?.nombre ?? '—',
      turnoParalelo: par?.turno ?? null,
      periodoParalelo: per?.nombre ?? null,
      periodoMateriaPlan: per?.nombre ?? null,
      cursoCodigo: c?.codigo ?? horarioMeta.cursoCodigo ?? '—',
      cursoColorHex: null,
      carrera: null,
      carreraColorHex: null,
      cargaHorariaSemanal: null,
      fechaAsignacion: null,
      gestion: null,
      planHabilitado: null,
      horasPlanMateria: null,
    };
  }, [cursoId, cursos, paralelos, paraleloId, periodos, periodoId, horarioMeta.cursoCodigo]);

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
      state: { menuSidebarKey },
    });
  }, [navigate, returnListPath, menuSidebarKey]);

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
    await reloadAsignaciones();
  }, [docenteId, gestionPlanId, periodoId, paraleloId, cursoId, cargaHorariaOpt, message, reloadAsignaciones]);

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
    await handleRegistrarAsignacion();
  }, [handleRegistrarAsignacion]);

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
              onCargaHorariaChange={setCargaHorariaOpt}
              asignaciones={asignaciones}
              loadingAsignaciones={loadingAsignaciones}
              errorAsignaciones={errorAsignaciones}
              asignacionesColumns={asignacionesColumns}
              returnListPath={returnListPath}
              menuSidebarKey={menuSidebarKey}
              previewAssignment={previewAssignment}
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
      asignaciones,
      loadingAsignaciones,
      errorAsignaciones,
      returnListPath,
      menuSidebarKey,
      previewAssignment,
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
            message="Ningún docente preseleccionado"
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
            finishLabel="Registrar asignación"
            nextLabel="Siguiente"
            prevLabel="Anterior"
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default DocentesAsignacionAcademica;
