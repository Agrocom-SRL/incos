/**
 * EstudiantesDetail - Rediseño moderno estilo HRment
 * Layout limpio: perfil compacto arriba + tabs con cards de 2 columnas abajo.
 */

import { useMemo } from 'react';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Spin, Alert, Empty, Tabs, Tag } from 'antd';
import {
  EnvironmentOutlined,
  FileTextOutlined,
  DollarOutlined,
  DownloadOutlined,
  BookOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  UserOutlined,
  FileProtectOutlined,
  GlobalOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useStudentDetailContext } from '@application-estudiantes/hooks';
import {
  GuardiansSection,
  DocumentDeliveriesSection,
  ScholarshipsSection,
} from '@estudiantes/components/organisms';
import './EstudiantesDetail.css';

/* ─────────────────────────────────────────
   Átomo: Field — label arriba, valor abajo
───────────────────────────────────────── */
const Field = ({ label, children, span = 1 }) => (
  <div className={`sd-field sd-field--span-${span}`}>
    <span className="sd-field__label">{label}</span>
    <span className="sd-field__value">{children ?? '—'}</span>
  </div>
);

/* ─────────────────────────────────────────
   Átomo: InfoCard — card de sección
───────────────────────────────────────── */
const InfoCard = ({ title, icon, extra, children, cols = 2 }) => (
  <div className="sd-card">
    <div className="sd-card__head">
      <span className="sd-card__title">
        {icon && <span className="sd-card__title-icon">{icon}</span>}
        {title}
      </span>
      {extra && <div className="sd-card__extra">{extra}</div>}
    </div>
    <div className={`sd-card__body sd-card__body--cols-${cols}`}>
      {children}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
const EstudiantesDetail = () => {
  const {
    loading, error, student, studentData,
    guardians, documentDeliveries, scholarships, inscripcion, origins,
    transitability, transfer, academicData, catalogs,
    breadcrumbItems, avatarInitials, profileSubtitle,
    handleRegistrarPago, handleGenerateActaCompromiso, handleGenerateDeclaracionJurada,
    handleDownloadActaCompromiso, handleVerInscripcion,
    handleNuevaInscripcion, tieneDocumentosFaltantesFlag,
    actaCompromisoData, loadingActa, loadingDeclaracion, hasInscripcion,
  } = useStudentDetailContext();

  const tipoAdmision = studentData?.tipoAdmision;
  const tipoAdmisionUpper = (tipoAdmision || '').toString().toUpperCase();
  const admissionKind =
    tipoAdmisionUpper === 'NUEVO'
      ? 'nuevo'
      : tipoAdmisionUpper === 'ANTIGUO'
        ? 'antiguo'
        : tipoAdmisionUpper === 'TRASPASO'
          ? 'traspaso'
          : tipoAdmisionUpper === 'TRANSITABILIDAD'
            ? 'transitabilidad'
            : tipoAdmision
              ? 'default'
              : null;

  const avatarClassName = admissionKind
    ? `sd-profile__avatar sd-profile__avatar--${admissionKind}`
    : 'sd-profile__avatar';

  const admissionPillClass = !admissionKind
    ? ''
    : admissionKind === 'nuevo'
      ? 'sd-profile__admission-pill sd-profile__admission-pill--nuevo'
      : admissionKind === 'antiguo'
        ? 'sd-profile__admission-pill sd-profile__admission-pill--antiguo'
        : admissionKind === 'traspaso'
          ? 'sd-profile__admission-pill sd-profile__admission-pill--traspaso'
          : admissionKind === 'transitabilidad'
            ? 'sd-profile__admission-pill sd-profile__admission-pill--transitabilidad'
            : 'sd-profile__admission-pill sd-profile__admission-pill--default';

  const showDeclaracionButton =
    tipoAdmisionUpper === 'TRASPASO' || tipoAdmisionUpper === 'TRANSITABILIDAD';

  const residenciaCompleta =
    studentData?.residenceAddressComplete ||
    [studentData?.municipioResidenciaName, studentData?.provinciaResidenciaName, studentData?.departamentoResidenciaName]
      .filter(Boolean).join(', ') || null;

  // Nacionalidad e idiomas derivados de origins
  const { nacionalidadLabel, idiomaMaterno, idiomaSecundario, lugarNacimiento, paises } = useMemo(() => {
    const list = Array.isArray(origins) ? origins : [];
    const isPrincipal = (o) => Number(o?.esPrincipal) === 1 || Number(o?.isPrincipal) === 1 || o?.esPrincipal === true || o?.isPrincipal === true;
    const principal = list.find(isPrincipal) || list[0];
    const secundario = list.find((o) => o !== principal) || null;

    let nacionalidadLabel = '—';
    if (list.length === 0) return { nacionalidadLabel: '—', idiomaMaterno: null, idiomaSecundario: null, lugarNacimiento: null, paises: null };
    if (list.length >= 2) {
      nacionalidadLabel = 'Doble nacionalidad';
    } else if (principal) {
      const tipo = principal.originType || principal.tipoOrigen || '';
      if (tipo === 'BOLIVIANA') nacionalidadLabel = 'Boliviano';
      else if (tipo === 'EXTRANJERA') nacionalidadLabel = 'Extranjero';
      else nacionalidadLabel = tipo || '—';
    }

    const idiomaMaterno = principal?.motherTongueName || principal?.motherTongueCode || null;
    const idiomaSecundario = principal?.secondaryLanguageName || principal?.secondaryLanguageCode || null;
    const lugarNacimiento = principal?.originAddressComplete || [principal?.birthCity, principal?.birthMunicipalityName, principal?.birthDepartmentName].filter(Boolean).join(', ') || null;
    const paises = list.length >= 2
      ? list.map((o) => o.countryName || o.countryId).filter(Boolean).join(' / ')
      : principal?.countryName || null;

    return { nacionalidadLabel, idiomaMaterno, idiomaSecundario, lugarNacimiento, paises };
  }, [origins]);

  /* Tab items */
  const tabItems = useMemo(() => [
    {
      key: 'informacion',
      label: <span className="sd-tab-label"><UserOutlined /> Información</span>,
      children: (
        <div className="sd-tab-body">
          <InfoCard title="Datos personales" icon={<UserOutlined />} cols={3}>
            <Field label="Código de estudiante">{studentData?.codigoEstudiante}</Field>
            <Field label="Cédula de identidad">{studentData?.ciCompleto}</Field>
            <Field label="Tipo de sangre">{studentData?.tipoSangre}</Field>

            <Field label="Nombres">{studentData?.nombres}</Field>
            <Field label="Apellido paterno">{studentData?.apellidoPaterno}</Field>
            <Field label="Apellido materno">{studentData?.apellidoMaterno}</Field>

            <Field label="Nombre completo" span={3}>{studentData?.nombreCompleto}</Field>

            <Field label="Fecha de nacimiento">{studentData?.fechaNacimiento}</Field>
            <Field label="Género">{studentData?.genero}</Field>
            <Field label="Estado civil">{studentData?.estadoCivilName || studentData?.estadoCivilId}</Field>

            <Field label="Correo electrónico" span={2}>
              {studentData?.emailPersonal
                ? <a href={`mailto:${studentData.emailPersonal}`} className="sd-link">{studentData.emailPersonal}</a>
                : null}
            </Field>
            <Field label="Celular">
              {studentData?.celular
                ? <a href={`tel:${studentData.celular}`} className="sd-link">{studentData.celular}</a>
                : null}
            </Field>

            <Field label="Teléfono fijo">{studentData?.telefonoFijo}</Field>
            <Field label="Zona">{studentData?.zona}</Field>
            <Field label="Dirección" span={2}>{studentData?.direccion}</Field>

            <Field label="Residencia" span={3}>{residenciaCompleta}</Field>

            {studentData?.observaciones && (
              <Field label="Observaciones" span={3}>{studentData.observaciones}</Field>
            )}
          </InfoCard>

          {(origins?.length > 0) && (
            <InfoCard title="Nacionalidad e idiomas" icon={<GlobalOutlined />} cols={3}>
              <Field label="Nacionalidad">{nacionalidadLabel}</Field>
              {paises && <Field label="País(s)">{paises}</Field>}
              <Field label="Idioma materno">{idiomaMaterno}</Field>
              <Field label="Idioma secundario">{idiomaSecundario}</Field>
              {lugarNacimiento && (
                <Field label="Lugar de nacimiento" span={3}>{lugarNacimiento}</Field>
              )}
            </InfoCard>
          )}

          <GuardiansSection guardians={guardians} />
        </div>
      ),
    },
    {
      key: 'academico',
      label: <span className="sd-tab-label"><BookOutlined /> Académico</span>,
      children: (
        <div className="sd-tab-body">
          {/* Datos académicos (estudiantes_datos_academicos): tipo admisión, gestión de ingreso, carrera */}
          {(academicData?.tipoAdmision != null || academicData?.admissionType != null || academicData?.managementId != null || academicData?.gestionIngresoId != null || academicData?.careerId != null || academicData?.carreraId != null) && (
            <InfoCard title="Datos académicos" icon={<BookOutlined />} cols={3}>
              <Field label="Tipo de admisión">
                {(academicData?.tipoAdmision ?? academicData?.admissionType)
                  ? <Tag color="blue" style={{ margin: 0 }}>{academicData.tipoAdmision ?? academicData.admissionType}</Tag>
                  : null}
              </Field>
              <Field label="Gestión de ingreso">
                {(() => {
                  const mg = academicData?.management;
                  if (mg && (mg.name || mg.year || mg.code)) {
                    return mg.name && mg.year ? `${mg.name} (${mg.year})` : (mg.name || mg.code || `ID: ${mg.id}`);
                  }
                  const mgId = academicData?.managementId ?? academicData?.gestionIngresoId;
                  const mgCat = mgId && catalogs?.managements?.[mgId] ? catalogs.managements[mgId] : null;
                  return mgCat ? `${mgCat.name ?? mgCat.nombre ?? ''} (${mgCat.year ?? mgCat.anio ?? ''})` : (mgId ? `ID: ${mgId}` : null);
                })()}
              </Field>
              <Field label="Carrera">
                {(() => {
                  const car = academicData?.career;
                  if (car && (car.name || car.code)) {
                    return car.code && car.name ? `${car.code} — ${car.name}` : (car.name || car.code || `ID: ${car.id}`);
                  }
                  const carId = academicData?.careerId ?? academicData?.carreraId;
                  const sameCareer = inscripcion?.studentAcademicData && (inscripcion.studentAcademicData.careerId === carId || inscripcion.studentAcademicData.carreraId === carId);
                  return sameCareer && inscripcion?.career?.name
                    ? `${inscripcion.career.code ?? ''} — ${inscripcion.career.name}`
                    : (carId ? `ID: ${carId}` : null);
                })()}
              </Field>
            </InfoCard>
          )}

          {inscripcion?.enrollment ? (
            <InfoCard
              title="Inscripción actual"
              icon={<BookOutlined />}
              cols={3}
              extra={
                <button type="button" className="sd-btn sd-btn--primary" onClick={handleVerInscripcion}>
                  <EyeOutlined /> Ver Detalle
                </button>
              }
            >
              <Field label="ID de inscripción">{inscripcion.enrollment.id}</Field>
              <Field label="Tipo de inscripción">
                {inscripcion.enrollment.enrollmentType
                  ? <Tag color="blue" style={{ margin: 0 }}>{inscripcion.enrollment.enrollmentType}</Tag>
                  : null}
              </Field>
              <Field label="Gestión">
                {inscripcion.management?.name
                  ? `${inscripcion.management.name} (${inscripcion.management.year})`
                  : inscripcion.enrollment.managementId ? `ID: ${inscripcion.enrollment.managementId}` : null}
              </Field>
              <Field label="Carrera" span={2}>
                {inscripcion.career?.name
                  ? `${inscripcion.career.code} — ${inscripcion.career.name}`
                  : inscripcion.studentAcademicData?.careerId ? `ID: ${inscripcion.studentAcademicData.careerId}` : null}
              </Field>
              <Field label="Estado de registro">
                {inscripcion.studentAcademicData?.registrationStatus
                  ? <Tag color={inscripcion.studentAcademicData.registrationStatus === 'ADMITIDO' ? 'success' : 'warning'} style={{ margin: 0 }}>
                      {inscripcion.studentAcademicData.registrationStatus}
                    </Tag>
                  : null}
              </Field>
              <Field label="Materias inscritas">
                {inscripcion.enrollmentSubjects?.length > 0
                  ? <span className="sd-badge sd-badge--blue">{inscripcion.enrollmentSubjects.length} materia(s)</span>
                  : null}
              </Field>
            </InfoCard>
          ) : (
            <div className="sd-empty">
              <BookOutlined className="sd-empty__icon" />
              <p className="sd-empty__text">Sin inscripción registrada</p>
              <button type="button" className="sd-btn sd-btn--primary" onClick={handleNuevaInscripcion}>
                <PlusCircleOutlined /> Nueva Inscripción
              </button>
            </div>
          )}
        </div>
      ),
    },
    ...((transitability || transfer) ? [{
      key: 'transitabilidad-traspaso',
      label: <span className="sd-tab-label"><SwapOutlined /> {transitability ? 'Transitabilidad' : 'Traspaso'}</span>,
      children: (
        <div className="sd-tab-body">
          {transitability && (
            <InfoCard title="Formación académica (Transitabilidad)" icon={<SwapOutlined />} cols={3}>
              <Field label="Unidad Educativa / Centro">{transitability.institucionNombre}</Field>
              <Field label="Tipo de institución">{transitability.tipoInstitucion}</Field>
              <Field label="Código SIE-UE">{transitability.codigoSie}</Field>
              <Field label="Dependencia">{transitability.dependencia}</Field>
              <Field label="Departamento">{transitability.departamento ?? (transitability.departamentoId ? `ID: ${transitability.departamentoId}` : null)}</Field>
              <Field label="Distrito educativo">{transitability.distritoEducativo}</Field>
              <Field label="Carrera de origen">{transitability.carreraOrigen}</Field>
              <Field label="Año de conclusión">{transitability.anioConclusion}</Field>
              <Field label="Régimen de estudios">{transitability.regimenEstudios}</Field>
              <Field label="Estado">
                {transitability.estado ? <Tag color={transitability.estado === 'PROCEDENTE' ? 'success' : 'default'} style={{ margin: 0 }}>{transitability.estado}</Tag> : null}
              </Field>
              {transitability.motivoNoProcedente && (
                <Field label="Motivo no procedente" span={3}>{transitability.motivoNoProcedente}</Field>
              )}
            </InfoCard>
          )}
          {transfer && !transitability && (
            <InfoCard title="Datos de traspaso" icon={<SwapOutlined />} cols={3}>
              <Field label="Instituto de origen">{transfer.institucionNombre}</Field>
              <Field label="Dependencia">{transfer.dependencia}</Field>
              <Field label="Departamento">{transfer.departamento ?? (transfer.departamentoId ? `ID: ${transfer.departamentoId}` : null)}</Field>
              <Field label="Distrito educativo">{transfer.distritoEducativo}</Field>
              <Field label="Carrera">{transfer.carreraOrigen}</Field>
              <Field label="Año cursado">{transfer.anioCursado}</Field>
              <Field label="Régimen de estudios">{transfer.regimenOrigen}</Field>
              <Field label="Estado">
                {transfer.estado ? <Tag color={transfer.estado === 'PROCEDENTE' ? 'success' : 'default'} style={{ margin: 0 }}>{transfer.estado}</Tag> : null}
              </Field>
              {transfer.motivoNoProcedente && (
                <Field label="Motivo no procedente" span={3}>{transfer.motivoNoProcedente}</Field>
              )}
            </InfoCard>
          )}
        </div>
      ),
    }] : []),
    {
      key: 'documentacion',
      label: <span className="sd-tab-label"><FileProtectOutlined /> Documentación</span>,
      children: (
        <div className="sd-tab-body">
          <DocumentDeliveriesSection documentDeliveries={documentDeliveries} />
          <ScholarshipsSection scholarships={scholarships} />
        </div>
      ),
    },
  ], [studentData, residenciaCompleta, guardians, documentDeliveries, scholarships, inscripcion, origins, nacionalidadLabel, idiomaMaterno, idiomaSecundario, lugarNacimiento, paises, handleVerInscripcion, handleNuevaInscripcion, academicData, catalogs, transitability, transfer]);

  /* ── Estados de carga / error ── */
  if (loading) return (
    <PageTemplate header={<PageHeader title="Detalle del Estudiante" breadcrumbItems={breadcrumbItems} />}>
      <div className="sd-loading"><Spin size="large" /><p>Cargando datos del estudiante…</p></div>
    </PageTemplate>
  );

  if (error) return (
    <PageTemplate header={<PageHeader title="Detalle del Estudiante" breadcrumbItems={breadcrumbItems} />}>
      <Alert message="Error al cargar el estudiante" description={error} type="error" showIcon />
    </PageTemplate>
  );

  if (!student?.student) return (
    <PageTemplate header={<PageHeader title="Detalle del Estudiante" breadcrumbItems={breadcrumbItems} />}>
      <Empty description="No se encontró información del estudiante" />
    </PageTemplate>
  );

  return (
    <PageTemplate header={<PageHeader title="Detalle del Estudiante" breadcrumbItems={breadcrumbItems} />}>
      <div className="sd">

        {/* ═══ PROFILE CARD ═══ */}
        <div className="sd-profile">

          {/* Avatar + nombre + subtítulo */}
          <div className="sd-profile__identity">
            <div className="sd-profile__avatar-wrap">
              <div className={avatarClassName}>{avatarInitials}</div>
              <span className="sd-profile__status-dot" />
            </div>
            <div className="sd-profile__name-block">
              <h1 className="sd-profile__name">{studentData.nombreCompleto || 'N/A'}</h1>
              <div className="sd-profile__meta">
                <p className="sd-profile__sub">
                  <EnvironmentOutlined />
                  {profileSubtitle}
                </p>
                {studentData?.tipoAdmision && (
                  <span
                    className={admissionPillClass}
                  >
                    {studentData.tipoAdmision}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="sd-profile__divider" />

          {/* Quick stats */}
          <div className="sd-profile__stats">
            <div className="sd-stat">
              <span className="sd-stat__label">Código</span>
              <span className="sd-stat__value sd-stat__value--primary">{studentData?.codigoEstudiante || '—'}</span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Teléfono</span>
              <span className="sd-stat__value">
                {studentData?.celular
                  ? <a href={`tel:${studentData.celular}`} className="sd-link">{studentData.celular}</a>
                  : studentData?.telefonoFijo || '—'}
              </span>
            </div>
            <div className="sd-stat">
              <span className="sd-stat__label">Correo</span>
              <span className="sd-stat__value">
                {studentData?.emailPersonal
                  ? <a href={`mailto:${studentData.emailPersonal}`} className="sd-link">{studentData.emailPersonal}</a>
                  : '—'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="sd-profile__divider" />

          {/* Actions */}
          <div className="sd-profile__actions">
            {showDeclaracionButton && (
              <button
                type="button"
                className="sd-btn sd-btn--warn"
                onClick={handleGenerateDeclaracionJurada}
                disabled={loadingDeclaracion}
              >
                <FileTextOutlined /> Declaración Jurada
              </button>
            )}
            {actaCompromisoData ? (
              <button type="button" className="sd-btn sd-btn--warn" onClick={handleDownloadActaCompromiso}>
                <DownloadOutlined /> Descargar Acta
              </button>
            ) : tieneDocumentosFaltantesFlag ? (
              <button type="button" className="sd-btn sd-btn--warn" onClick={handleGenerateActaCompromiso} disabled={loadingActa}>
                <FileTextOutlined /> Generar Acta
              </button>
            ) : null}
            <button type="button" className="sd-btn sd-btn--danger" onClick={handleRegistrarPago}>
              <DollarOutlined /> Registrar Pago
            </button>
            <button type="button" className="sd-btn sd-btn--primary" onClick={handleNuevaInscripcion}>
              {hasInscripcion ? <><EyeOutlined /> Ver Inscripción</> : <><PlusCircleOutlined /> Nueva Inscripción</>}
            </button>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="sd-tabs-shell">
          <Tabs defaultActiveKey="informacion" items={tabItems} className="sd-tabs" />
        </div>

      </div>
    </PageTemplate>
  );
};

export default EstudiantesDetail;
