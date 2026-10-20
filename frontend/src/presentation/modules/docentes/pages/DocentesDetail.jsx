/**
 * Ficha de docente — detalle con perfil, nacionalidad/domicilio, acceso y materias asignadas.
 * El color del docente se edita en Materias asignadas; el armado de horarios vive en Institucional.
 */

import { useMemo, useState } from 'react';
import { Spin, Alert, Tabs } from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  EnvironmentOutlined,
  BookOutlined,
  SolutionOutlined,
  IdcardOutlined,
  CarryOutOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext, esDocente } from '@application-auth';
import { useDocentesDetailContext } from '@application-docentes/hooks';
import DetailField from '@docentes/components/atoms/DetailField';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import { getGeneroMeta } from '@docentes/utils/generoMeta';
import {
  formatNivelAcademicoDocente,
  formatTipoContratoDocente,
  formatEstadoLaboralDocente,
} from '@docentes/config';
import DocenteProfileSummary from '@docentes/components/organisms/DocenteProfileSummary';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
import DocenteAccessSection from '@docentes/components/organisms/DocenteAccessSection';
import MisFichasSeguimientoTab from '@docentes/supervision/components/organisms/MisFichasSeguimientoTab';
import '@docentes/styles/docentes-detail-page.css';

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
  const { hasPermiso, usuario } = useAuthContext();
  const {
    docenteId,
    loading,
    error,
    profile,
    assignments,
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

  const hasMateriasAsignadas = assignments.length > 0;

  // Portal del docente: llega directo a SU ficha desde el menú ("Mi ficha"),
  // sin haber pasado por un listado — se oculta el botón "Volver" por no tener
  // un destino de navegación con sentido en ese flujo (no es una decisión de
  // autorización: editar/eliminar ya se ocultan solos por permiso, fail-closed).
  const esMiFicha = esDocente(usuario);

  // Tab activa controlada: gobierna la carga lazy de "Supervisión" (solo se
  // pide `/mis-fichas` la primera vez que el docente abre esa tab).
  const [activeTabKey, setActiveTabKey] = useState('resumen');

  const headerActions = esMiFicha ? null : (
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
              <DetailField label="Género">{getGeneroMeta(profile.genero)?.label}</DetailField>
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
              <DetailField label="Nivel académico">
                {formatNivelAcademicoDocente(profile.nivelAcademico)}
              </DetailField>
              <DetailField label="Institución de egreso">{profile.institucionEgreso}</DetailField>
              <DetailField label="Año de egreso">{profile.anioEgreso}</DetailField>
              <DetailField label="Años de experiencia">{profile.aniosExperiencia}</DetailField>
            </DetailInfoCard>
            <DetailInfoCard title="Condición laboral" icon={<CarryOutOutlined />} cols={3} headVariant="labor">
              <DetailField label="Tipo de contrato">
                {formatTipoContratoDocente(profile.tipoContrato)}
              </DetailField>
              <DetailField label="Estado laboral">
                {formatEstadoLaboralDocente(profile.estadoLaboral)}
              </DetailField>
              <DetailField label="Fecha de contratación">{fmtDate(profile.fechaContratacion)}</DetailField>
              <DetailField label="Fecha de retiro">{fmtDate(profile.fechaRetiro)}</DetailField>
              <DetailField label="Máx. horas / semana">{profile.maxHorasSemana ?? '—'}</DetailField>
              <DetailField label="Máx. horas / mes">{profile.maxHorasMes ?? '—'}</DetailField>
              <DetailField label="Registro activo">{profile.registroActivo ? 'Sí' : 'No'}</DetailField>
              <DetailField label="Observaciones" span={3}>
                {profile.observaciones}
              </DetailField>
            </DetailInfoCard>
          </div>
        ),
      },
      {
        key: 'materias',
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Materias asignadas
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DocenteAssignmentsSection
              assignments={assignments}
              puedeAsignarMaterias={puedeAsignarMaterias}
              onAsignarMaterias={handleAsignacionAcademica}
              showManageButtonInCard={puedeGestionarAsignaciones}
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
      // Portal del docente: solo su propia ficha (esMiFicha) ve sus fichas de
      // seguimiento (S5, wrapper self sin permiso nuevo). Carga lazy: solo
      // dispara la petición cuando esta tab está activa.
      ...(esMiFicha
        ? [
            {
              key: 'supervision',
              label: (
                <span className="sd-tab-label">
                  <AuditOutlined /> Supervisión
                </span>
              ),
              children: <MisFichasSeguimientoTab enabled={activeTabKey === 'supervision'} />,
            },
          ]
        : []),
    ],
    [
      profile,
      assignments,
      access,
      nombreCompleto,
      docenteId,
      puedeCrearUsuario,
      puedeEditarUsuario,
      puedeAsignarMaterias,
      puedeGestionarAsignaciones,
      handleAsignacionAcademica,
      esMiFicha,
      activeTabKey,
    ],
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
                estadoLaboral={formatEstadoLaboralDocente(profile.estadoLaboral)}
                ciCompleto={profile.ciCompleto}
                celular={profile.celular}
                emailPersonal={profile.emailPersonal}
                registroActivo={Boolean(profile.registroActivo)}
                colorHex={profile.colorHex}
                maxHorasSemana={profile.maxHorasSemana}
                hasMateriasAsignadas={hasMateriasAsignadas}
                onEditar={handleEditar}
                puedeEditar={puedeEditar}
              />
              <div className="sd-tabs-shell">
                <Tabs
                  activeKey={activeTabKey}
                  onChange={setActiveTabKey}
                  items={tabItems}
                  className="sd-tabs"
                />
              </div>
            </>
          )}
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default DocentesDetail;
