/**
 * Ficha de docente — detalle con perfil, nacionalidad/domicilio, acceso, asignaciones y horarios.
 * Capa presentación: consume DocentesDetailContext (aplicación + API ya resueltas).
 */

import { useMemo } from 'react';
import { Spin, Alert, Tabs } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BookOutlined,
  SolutionOutlined,
  IdcardOutlined,
  CarryOutOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import { useDocentesDetailContext } from '@application-docentes/hooks';
import DetailField from '@docentes/components/atoms/DetailField';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import DocenteProfileSummary from '@docentes/components/organisms/DocenteProfileSummary';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
import DocenteSchedulesSection from '@docentes/components/organisms/DocenteSchedulesSection';
import DocenteAccessSection from '@docentes/components/organisms/DocenteAccessSection';

const fmtDate = (v) => {
  if (!v) return '—';
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(v);
  }
};

const DocentesDetail = () => {
  const { hasPermiso } = useAuthContext();
  const {
    docenteId,
    loading,
    error,
    profile,
    assignments,
    courseSchedules,
    access,
    nombreCompleto,
    iniciales,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleAsignacionAcademica,
  } = useDocentesDetailContext();

  const puedeEditar = hasPermiso('docentes.editar', 'EDITAR');
  const puedeAsignarMaterias = hasPermiso('docentes.asignar', 'EDITAR');
  const puedeGestionarAsignaciones =
    hasPermiso('docentes.asignar', 'CREAR') ||
    hasPermiso('docentes.asignar', 'EDITAR') ||
    hasPermiso('docentes.asignar', 'ELIMINAR') ||
    hasPermiso('docentes.editar', 'EDITAR');
  const puedeCrearUsuario = hasPermiso('seguridad.usuario.crear', 'CREAR');
  const puedeEditarUsuario = hasPermiso('seguridad.usuario.administrar', 'EDITAR');

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
      <ArrowLeftOutlined /> Volver
    </button>
  );

  const tabItems = useMemo(
    () => [
      {
        key: 'resumen',
        label: (
          <span className="sd-tab-label">
            <UserOutlined /> Resumen
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard title="Datos personales" icon={<UserOutlined />} cols={3}>
              <DetailField label="Nombre completo">{profile.nombreCompleto}</DetailField>
              <DetailField label="CI">{profile.ciCompleto}</DetailField>
              <DetailField label="Género">{profile.genero}</DetailField>
              <DetailField label="Fecha de nacimiento">{fmtDate(profile.fechaNacimiento)}</DetailField>
              <DetailField label="Estado civil">{profile.estadoCivil}</DetailField>
              <DetailField label="Correo personal">{profile.emailPersonal}</DetailField>
              <DetailField label="Celular">{profile.celular}</DetailField>
              <DetailField label="Teléfono fijo">{profile.telefono}</DetailField>
            </DetailInfoCard>
            <DetailInfoCard title="Nacionalidad y domicilio" icon={<EnvironmentOutlined />} cols={3}>
              <DetailField label="Nacionalidad">{profile.nacionalidad}</DetailField>
              <DetailField label="País(es)">{profile.paisResidencia}</DetailField>
              <DetailField label="Dirección" span={3}>
                {profile.direccion}
              </DetailField>
              <DetailField label="Zona / barrio">{profile.zona}</DetailField>
            </DetailInfoCard>
          </div>
        ),
      },
      {
        key: 'laboral',
        label: (
          <span className="sd-tab-label">
            <SolutionOutlined /> Formación y labor
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard title="Formación y trayectoria" icon={<BookOutlined />} cols={3} headVariant="labor">
              <DetailField label="Título profesional">{profile.tituloProfesional}</DetailField>
              <DetailField label="Especialidad">{profile.especialidad}</DetailField>
              <DetailField label="Nivel académico">{profile.nivelAcademico}</DetailField>
              <DetailField label="Institución de egreso">{profile.institucionEgreso}</DetailField>
              <DetailField label="Año de egreso">{profile.anioEgreso}</DetailField>
              <DetailField label="Años de experiencia">{profile.aniosExperiencia}</DetailField>
            </DetailInfoCard>
            <DetailInfoCard title="Condición laboral" icon={<CarryOutOutlined />} cols={3} headVariant="labor">
              <DetailField label="Tipo de contrato">{profile.tipoContrato}</DetailField>
              <DetailField label="Estado laboral">{profile.estadoLaboral}</DetailField>
              <DetailField label="Fecha de contratación">{fmtDate(profile.fechaContratacion)}</DetailField>
              <DetailField label="Fecha de retiro">{fmtDate(profile.fechaRetiro)}</DetailField>
              <DetailField label="Registro activo">{profile.registroActivo ? 'Sí' : 'No'}</DetailField>
              <DetailField label="Observaciones" span={3}>
                {profile.observaciones}
              </DetailField>
            </DetailInfoCard>
          </div>
        ),
      },
      {
        key: 'academico',
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Académico
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DocenteAssignmentsSection
              assignments={assignments}
              puedeAsignarMaterias={puedeAsignarMaterias}
              onAsignarMaterias={() => handleAsignacionAcademica({ focus: 'cursos' })}
              showManageButtonInCard={puedeGestionarAsignaciones}
            />
          </div>
        ),
      },
      {
        key: 'horarios',
        label: (
          <span className="sd-tab-label">
            <ScheduleOutlined /> Horarios
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DocenteSchedulesSection
              courseSchedules={courseSchedules}
              puedeAsignarMaterias={puedeAsignarMaterias}
              onAsignarMaterias={() => handleAsignacionAcademica({ focus: 'horarios' })}
            />
          </div>
        ),
      },
      {
        key: 'acceso',
        label: (
          <span className="sd-tab-label">
            <IdcardOutlined /> Acceso al sistema
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DocenteAccessSection
              access={access}
              docenteId={docenteId}
              docenteNombreCompleto={nombreCompleto}
              docenteCiCompleto={profile.ciCompleto}
              docenteEmailPersonal={profile.emailPersonal}
              puedeCrearUsuario={puedeCrearUsuario}
              puedeEditarUsuario={puedeEditarUsuario}
            />
          </div>
        ),
      },
    ],
    [
      profile,
      assignments,
      courseSchedules,
      access,
      nombreCompleto,
      docenteId,
      puedeCrearUsuario,
      puedeEditarUsuario,
      puedeAsignarMaterias,
      puedeGestionarAsignaciones,
      handleAsignacionAcademica,
    ]
  );

  return (
    <PageTemplate
      header={
        <PageHeader title="Ficha del docente" breadcrumbItems={breadcrumbItems} actions={headerActions} />
      }
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando ficha…">
        <div className="sd sd-spin-body">
          {!loading && error && (
            <Alert type="error" title="No se pudo cargar la ficha" description={error} showIcon style={{ marginBottom: 16 }} />
          )}
          {!loading && !error && (
            <>
              <DocenteProfileSummary
                nombreCompleto={nombreCompleto}
                iniciales={iniciales}
                tituloProfesional={profile.tituloProfesional}
                estadoLaboral={profile.estadoLaboral}
                ciCompleto={profile.ciCompleto}
                celular={profile.celular}
                emailPersonal={profile.emailPersonal}
                registroActivo={Boolean(profile.registroActivo)}
                onEditar={handleEditar}
                puedeEditar={puedeEditar}
              />
              <div className="sd-tabs-shell">
                <Tabs defaultActiveKey="resumen" items={tabItems} className="sd-tabs" />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default DocentesDetail;
