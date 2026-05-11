import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useInscripcionDetailContext, useGenerateBoletaInscripcion } from '@application-inscripciones/hooks';
import { useAuthContext } from '@application-auth';
import { Spin, Alert, Empty, Tag, Tabs, Tooltip, Table } from 'antd';
import { Button } from '@atoms';
import {
  DownloadOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  getSabadoArmadoGridRangeMinutes,
  getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import ParaleloPlanSemanaCell from '@institucional/horarios/components/atoms/ParaleloPlanSemanaCell';
import '@presentation/styles/pages/detail-page.css';

const SLOT_STEP_INSCRIPCION = 45;

const Field = ({ label, children, span = 1 }) => (
  <div className={`sd-field sd-field--span-${span}`}>
    <span className="sd-field__label">{label}</span>
    <span className="sd-field__value">{children ?? '—'}</span>
  </div>
);

const InfoCard = ({ title, icon, extra, children, cols = 2, headVariant }) => (
  <div className="sd-card">
    <div className={`sd-card__head${headVariant ? ` sd-card__head--${headVariant}` : ''}`}>
      <span className="sd-card__title">
        {icon && <span className="sd-card__title-icon">{icon}</span>}
        {title}
      </span>
      {extra && <div className="sd-card__extra">{extra}</div>}
    </div>
    <div className={`sd-card__body sd-card__body--cols-${cols}`}>{children}</div>
  </div>
);

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'IN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const normalizeAulaLabel = (aula) => {
  if (!aula) return null;
  if (typeof aula === 'string') return aula;
  if (typeof aula === 'object') {
    return aula.nombre || aula.codigo || aula.name || aula.code || null;
  }
  return null;
};

const InscripcionesDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { message } = App.useApp();
  const { hasPermiso } = useAuthContext();

  const puedeGenerarBoletaPdf = hasPermiso('matricula.documento.ver', 'GENERAR_PDF');
  const puedeEditarInscripcion = hasPermiso('matricula.inscripcion.editar', 'EDITAR');

  // Obtener datos del contexto
  const {
    inscripcion,
    loading = false,
    error = null,
  } = useInscripcionDetailContext();

  const { generateBoletaInscripcion, loading: generatingBoleta } = useGenerateBoletaInscripcion();

  const boletaInscripcion =
    inscripcion?.formularioInscripcion ?? inscripcion?.data?.formularioInscripcion ?? null;
  const studentId = inscripcion?.student?.id || inscripcion?.enrollment?.studentId;

  const handleDownloadOrGenerateBoleta = async () => {
    if (!studentId) {
      message.error('No se puede continuar: ID del estudiante no disponible');
      return;
    }

    try {
      const result = await generateBoletaInscripcion(studentId);

      if (result.success) {
        message.success(boletaInscripcion
          ? 'Boleta de inscripción descargada correctamente'
          : 'Boleta de inscripción generada y descargada exitosamente');
        if (!boletaInscripcion) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        message.error(result.error || 'Error al obtener la boleta de inscripción');
      }
    } catch (err) {
      console.error('Error al obtener la boleta de inscripción:', err);
      message.error('Error al obtener la boleta de inscripción. La operación puede estar tardando más de lo esperado.');
    }
  };

  const handleVolverAtras = useCallback(() => {
    const studentIdFromState = location.state?.studentId;
    const studentIdFromData = inscripcion?.student?.id || inscripcion?.enrollment?.studentId;
    const targetStudentId = studentIdFromState || studentIdFromData;

    if (targetStudentId) {
      navigate(`/estudiantes/${targetStudentId}`);
    } else {
      navigate('/matricula/listar');
    }
  }, [navigate, location.state, inscripcion]);

  const handleEditar = useCallback(() => {
    if (!id) return;
    navigate(`/inscripciones/${id}/editar`);
  }, [navigate, id]);

  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Lista de Matrículas', href: '/matricula/listar' },
    { title: 'Detalle de la Inscripción' },
  ], []);

  const tipoInscripcion = inscripcion?.enrollment?.tipoInscripcion ?? inscripcion?.enrollment?.tipo_inscripcion ?? null;
  const canEdit = tipoInscripcion && ['NUEVO', 'REINGRESO', 'CONTINUIDAD'].includes(tipoInscripcion);

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolverAtras}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  const {
    enrollment,
    studentAcademicData,
    management,
    student,
    career,
    enrollmentSubjects = [],
  } = inscripcion ?? {};

  const getStatusColor = (status) => {
    const statusColors = {
      'INSCRITO': 'blue',
      'EN_CURSO': 'processing',
      'APROBADO': 'success',
      'REPROBADO': 'error',
      'ANULADO': 'default',
    };
    return statusColors[status] || 'default';
  };

  const getEnrollmentTypeColor = (type) => {
    const typeColors = {
      'NUEVO': 'green',
      'REINGRESO': 'orange',
      'CONTINUIDAD': 'blue',
      'TRASPASO': 'cyan',
      'TRANSITABILIDAD': 'gold',
    };
    return typeColors[type] || 'default';
  };

  const nombreCompleto = [student?.nombres, student?.apellidoPaterno, student?.apellidoMaterno]
    .filter(Boolean)
    .join(' ')
    .trim();

  const avatarText = initialsFromName(nombreCompleto || `INS-${enrollment?.id || ''}`);

  const columnasMaterias = useMemo(
    () => [
      {
        title: 'Sigla',
        dataIndex: 'materiaSigla',
        key: 'materiaSigla',
        width: 110,
        render: (v) => v || '—',
      },
      {
        title: 'Materia',
        dataIndex: 'materiaNombre',
        key: 'materiaNombre',
        render: (v) => v || '—',
      },
      {
        title: 'Estado',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (status) => (status ? <Tag color={getStatusColor(status)}>{status}</Tag> : '—'),
      },
      {
        title: 'Docente',
        key: 'docente',
        render: (_, row) => row.docente?.nombreCompleto || 'Sin docente asignado',
      },
      {
        title: 'Horarios',
        key: 'horarios',
        width: 180,
        render: (_, row) => {
          const total = Array.isArray(row.horarios) ? row.horarios.length : 0;
          return total > 0 ? `${total} bloque(s)` : 'Sin bloques';
        },
      },
    ],
    [],
  );

  const materiasConHorario = useMemo(
    () =>
      (enrollmentSubjects || []).filter(
        (materia) => Array.isArray(materia?.horarios) && materia.horarios.length > 0,
      ),
    [enrollmentSubjects],
  );

  const turnoParaGrillaInscripcion = useMemo(
    () =>
      enrollment?.parallel?.turno ??
      enrollment?.shift ??
      materiasConHorario[0]?.paralelo?.turno ??
      materiasConHorario[0]?.parallel?.turno ??
      materiasConHorario[0]?.shift ??
      null,
    [enrollment, materiasConHorario],
  );

  const gridRangeInscripcion = useMemo(
    () => getTurnoGridRangeMinutes(turnoParaGrillaInscripcion),
    [turnoParaGrillaInscripcion],
  );
  const sabadoRangeInscripcion = useMemo(() => getSabadoArmadoGridRangeMinutes(), []);

  const courseSchedules = useMemo(
    () =>
      materiasConHorario.map((materia) => ({
        cursoId: materia.courseId ?? materia.cursoId ?? materia.id ?? null,
        cursoCodigo: materia.courseCode ?? materia.cursoCodigo ?? materia.curso ?? materia.materiaSigla ?? '—',
        cursoColorHex: materia.colorHex ?? materia.color ?? null,
        materiaNombre: materia.materiaNombre ?? materia.name ?? 'Materia sin nombre',
        materiaSigla: materia.materiaSigla ?? materia.sigla ?? null,
        carrera: career?.nombre ?? null,
        paralelo:
          materia.paralelo?.nombre ??
          materia.parallel?.nombre ??
          materia.parallelName ??
          enrollment?.parallel?.nombre ??
          enrollment?.parallelName ??
          null,
        turno:
          materia.paralelo?.turno ??
          materia.parallel?.turno ??
          materia.shift ??
          enrollment?.parallel?.turno ??
          enrollment?.shift ??
          null,
        docente: materia.docente?.nombreCompleto ?? null,
        bloques: (materia.horarios || [])
          .map((item, idx) => {
            const horario = item?.horario || item;
            if (!horario?.dia || !horario?.horaInicio) return null;
            return {
              cursoHorarioId: item?.id ?? `${materia.id || materia.materiaSigla || 'm'}-${idx}`,
              dia: horario.dia,
              horaInicio: horario.horaInicio,
              horaFin: horario.horaFin,
              aula: normalizeAulaLabel(item?.aula),
              orden: item?.ordenSecuencia ?? item?.orden ?? idx + 1,
            };
          })
          .filter(Boolean),
      })),
    [materiasConHorario, enrollment, career],
  );

  const tabItems = useMemo(
    () => [
      {
        key: 'inscripcion',
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Inscripción
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <InfoCard title="Estudiante" icon={<UserOutlined />} cols={3} headVariant="resumen">
              <Field label="Código">{student?.codigoEstudiante}</Field>
              <Field label="CI">
                {student?.ci ? `${student.ci}${student.expedicion ? ` ${student.expedicion}` : ''}` : '—'}
              </Field>
              <Field label="Género">{student?.genero}</Field>
              <Field label="Nombre completo" span={2}>{nombreCompleto || '—'}</Field>
              <Field label="Celular">{student?.celular}</Field>
            </InfoCard>

            <InfoCard title="Inscripción y carrera" icon={<EnvironmentOutlined />} cols={3}>
              <Field label="Tipo de inscripción">
                {enrollment?.tipoInscripcion ? (
                  <Tag color={getEnrollmentTypeColor(enrollment.tipoInscripcion)} style={{ margin: 0 }}>
                    {enrollment.tipoInscripcion}
                  </Tag>
                ) : '—'}
              </Field>
              <Field label="Estado de registro">
                {studentAcademicData?.estadoRegistro ? (
                  <Tag color={studentAcademicData.estadoRegistro === 'ADMITIDO' ? 'success' : 'warning'} style={{ margin: 0 }}>
                    {studentAcademicData.estadoRegistro}
                  </Tag>
                ) : '—'}
              </Field>
              <Field label="Tipo de gestión">{management?.tipo || '—'}</Field>
              <Field label="Gestión">
                {management?.nombre
                  ? `${management.nombre}${management.anio ? ` (${management.anio})` : ''}`
                  : '—'}
              </Field>
              <Field label="Carrera código">{career?.codigo || '—'}</Field>
              <Field label="Carrera">{career?.nombre || '—'}</Field>
              <Field label="Título otorgado" span={3}>{career?.tituloOtorgado || '—'}</Field>
              <Field label="Materias inscritas" span={3}>
                {enrollmentSubjects.length > 0 ? (
                  <span className="sd-badge sd-badge--blue">{enrollmentSubjects.length} materia(s)</span>
                ) : '—'}
              </Field>
            </InfoCard>
          </div>
        ),
      },
      {
        key: 'materias',
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Materias
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            {enrollmentSubjects.length === 0 ? (
              <div className="sd-empty">
                <BookOutlined className="sd-empty__icon" />
                <p className="sd-empty__text">No hay materias inscritas para esta inscripción</p>
              </div>
            ) : (
              <InfoCard title={`Materias inscritas (${enrollmentSubjects.length})`} icon={<BookOutlined />} cols={1}>
                <Table
                  dataSource={enrollmentSubjects}
                  columns={columnasMaterias}
                  rowKey={(row, idx) => row.id || `${row.materiaSigla || 'materia'}-${idx}`}
                  size="small"
                  pagination={false}
                />
              </InfoCard>
            )}
          </div>
        ),
      },
      {
        key: 'horarios',
        label: (
          <span className="sd-tab-label">
            <CalendarOutlined /> Horarios
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <section className="da-cal-semanal-section" aria-labelledby="inscripcion-horarios-title">
              <header className="da-cal-semanal-section__head">
                <CalendarOutlined className="da-cal-semanal-section__icon" aria-hidden />
                <h2 id="inscripcion-horarios-title" className="da-cal-semanal-section__title">
                  Calendario semanal de materias inscritas
                </h2>
              </header>
              <p className="da-cal-semanal-section__lede">
                Cada bloque muestra hora, sigla, nombre de la materia, paralelo, turno, docente y aula para que puedas
                ubicarte en la semana.
              </p>
              {courseSchedules.length > 0 ? (
                <DocenteHorarioSemanalGrid
                  courseSchedules={courseSchedules}
                  CellComponent={ParaleloPlanSemanaCell}
                  gridTimeRange={gridRangeInscripcion}
                  saturdayGridTimeRange={sabadoRangeInscripcion}
                  slotStepMinutes={SLOT_STEP_INSCRIPCION}
                  uniformSlotGrid
                  editable={false}
                  cellExtraProps={{}}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Sin horarios asignados en las materias inscritas"
                />
              )}
            </section>
          </div>
        ),
      },
    ],
    [
      enrollment,
      studentAcademicData,
      management,
      student,
      career,
      enrollmentSubjects,
      columnasMaterias,
      courseSchedules,
      nombreCompleto,
      gridRangeInscripcion,
      sabadoRangeInscripcion,
    ],
  );

  if (loading) {
    return (
      <PageTemplate header={<PageHeader title="Detalle de la Inscripción" breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
        <div className="sd-loading">
          <Spin size="large" />
          <p>Cargando datos de la inscripción…</p>
        </div>
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate header={<PageHeader title="Detalle de la Inscripción" breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
        <Alert
          title="Error al cargar la inscripción"
          description={error}
          type="error"
          showIcon
        />
      </PageTemplate>
    );
  }

  if (!inscripcion || !inscripcion.enrollment) {
    return (
      <PageTemplate header={<PageHeader title="Detalle de la Inscripción" breadcrumbItems={breadcrumbItems} actions={headerActions} />}>
        <Empty description="No se encontró información de la inscripción" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de la Inscripción"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
    >
      <div className="sd">
        <div className="sd-profile">
          {puedeEditarInscripcion ? (
            <Tooltip title="Editar inscripción">
              <button
                type="button"
                className="sd-profile__edit-btn"
                onClick={handleEditar}
                aria-label="Editar inscripción"
                disabled={!canEdit}
              >
                <EditOutlined />
              </button>
            </Tooltip>
          ) : null}

          <div className="sd-profile__identity">
            <div className="sd-profile__avatar-wrap">
              <div className="sd-profile__avatar sd-profile__avatar--default">{avatarText}</div>
              <span className="sd-profile__status-dot" />
            </div>
            <div className="sd-profile__name-block">
              <h1 className="sd-profile__name">{nombreCompleto || 'Estudiante sin nombre'}</h1>
              <div className="sd-profile__meta">
                <p className="sd-profile__sub">
                  <BookOutlined /> Resumen de matrícula
                </p>
                {tipoInscripcion ? (
                  <span className="sd-profile__admission-pill sd-profile__admission-pill--default">
                    {tipoInscripcion}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__stats">
            <div className="sd-stat">
              <span className="sd-stat__label">Código estudiante</span>
              <span className="sd-stat__value sd-stat__value--primary">{student?.codigoEstudiante || '—'}</span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Gestión</span>
              <span className="sd-stat__value">
                {management?.nombre ? `${management.nombre}${management?.anio ? ` (${management.anio})` : ''}` : '—'}
              </span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Materias</span>
              <span className="sd-stat__value">{enrollmentSubjects.length || 0}</span>
            </div>
          </div>

          <div className="sd-profile__divider" />

          <div className="sd-profile__actions">
            {puedeGenerarBoletaPdf ? (
              <button type="button" className="sd-btn sd-btn--primary" onClick={handleDownloadOrGenerateBoleta}
                disabled={generatingBoleta || !studentId}>
                {boletaInscripcion ? <DownloadOutlined /> : <FileTextOutlined />} {boletaInscripcion ? 'Descargar boleta' : 'Generar boleta'}
              </button>
            ) : null}
          </div>
        </div>

        <div className="sd-tabs-shell">
          <Tabs defaultActiveKey="inscripcion" items={tabItems} className="sd-tabs" />
        </div>
      </div>
    </PageTemplate>
  );
};

export default InscripcionesDetail;
