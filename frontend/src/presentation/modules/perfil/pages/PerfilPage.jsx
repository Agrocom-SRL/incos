/**
 * PerfilPage — "Mi perfil".
 *
 * Tres comportamientos según el rol:
 *  - Staff/admin: ficha de cuenta/rol + persona/ficha (igual que siempre).
 *  - ESTUDIANTE: hub de portal — cabecera compacta + tarjeta de cuenta + una grilla
 *    de accesos (resumen + navegación) a Mis datos, Mi matrícula, Mis aportes y Mi
 *    boletín. SOLO LECTURA salvo "Cambiar contraseña" (self-service).
 *  - DOCENTE: hub análogo — cabecera con título profesional y métricas de carga
 *    (cursos, horas, gestión) + los mismos accesos directos del dashboard:
 *    Mi ficha, Mis cursos, Asistencia, Mis estudiantes y Mi horario.
 */

import { useNavigate } from 'react-router-dom';
import {
  BookOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  DollarOutlined,
  IdcardOutlined,
  LockOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Flex, Tag, Typography } from 'antd';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { DetailField, Button, StatusPill } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';
import { rolPillClass } from '@modules/seguridad/roles/components/atoms/rolColor.js';
import '@modules/seguridad/roles/styles/roles.css';
import { buildInitials, formatBsConSimbolo } from '@application/utils/formatters';
import { usePerfilPageContext } from '@/application/modules/perfil/hooks';
import CambiarMiPasswordModal from '@modules/perfil/components/modals/CambiarMiPasswordModal.jsx';
import DashboardAccesoHubCard from '@dashboard/components/molecules/DashboardAccesoHubCard.jsx';
import '@dashboard/styles/estudiante-home.css';

const { Title } = Typography;

/** Rutas internas del portal del estudiante (navegación segura). */
const PATH_MIS_DATOS = '/estudiantes/listar';
const PATH_MATRICULA = '/matricula/listar';
const PATH_APORTES = '/matricula/aportes/listar';
const PATH_BOLETIN = '/academico/mi-boletin';

/** Rutas internas del portal del docente (navegación segura). */
const PATH_MI_FICHA = '/docentes/listar';
const PATH_MIS_CURSOS = '/academico/calificaciones';
const PATH_ASISTENCIA = '/academico/asistencia';
const PATH_MIS_ESTUDIANTES = '/matricula/listar';
const PATH_MI_HORARIO = '/docentes/mi-horario';

/** Une partes de un resumen omitiendo las ausentes; cae a un texto guía. */
function resumen(partes, fallback) {
  const texto = partes.filter(Boolean).join(' · ');
  return texto || fallback;
}

/** Valor de una línea del `vinculo_perfil` por etiqueta (backend /auth/me). */
function lineaValor(lineas, etiqueta) {
  return lineas?.find((ln) => ln?.etiqueta === etiqueta)?.valor || null;
}

export default function PerfilPage() {
  const navigate = useNavigate();
  const {
    usuario,
    loading,
    vinculoPerfil,
    esEstudiante,
    esDocente,
    resumenEstudiante,
    resumenDocente,
    openPass,
    saving,
    breadcrumbItems,
    setOpenPass,
    cambiarPassword,
  } = usePerfilPageContext();

  const rol = usuario?.rol;
  const tipoRol = !rol ? '—' : rol.is_system ? 'Sistema' : 'Personalizado';

  // Pill de rol con el color por categoría del módulo de Seguridad (roles.css),
  // la misma que usan el header y la grilla de roles.
  const rolPill = rol?.nombre ? (
    <StatusPill label={rol.nombre} className={rolPillClass(rol.tipo, Boolean(rol.is_system))} />
  ) : null;

  /** Navega solo a rutas internas seguras. */
  const navegarSeguro = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) navigate(path);
  };

  const nombreMostrado = vinculoPerfil?.nombre_completo || usuario?.username;
  const correo = usuario?.email || 'Sin correo';

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Mi perfil"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button variant="primary" icon={<LockOutlined />} onClick={() => setOpenPass(true)}>
              Cambiar contraseña
            </Button>
          }
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando perfil…"
        showEmpty={!loading && !usuario}
        emptyDescription="No se pudo cargar tu perfil"
      >
        {usuario ? (
          esEstudiante ? (
            /* ── Hub del estudiante ── */
            <>
              <DetailProfileCard
                avatarInitials={buildInitials(nombreMostrado)}
                avatarClassName="sd-profile__avatar sd-profile__avatar--default"
                title={nombreMostrado}
                subtitle={correo}
                metaExtra={rolPill ?? <Tag color="green">Estudiante</Tag>}
              />

              <DetailInfoCard title="Cuenta" icon={<UserOutlined />} cols={2}>
                <DetailField label="Usuario">{usuario.username}</DetailField>
                <DetailField label="Correo">{usuario.email || '—'}</DetailField>
                <DetailField label="Rol">{rolPill ?? '—'}</DetailField>
              </DetailInfoCard>

              <Flex vertical gap={allSpacing.margin}>
                <Title
                  level={4}
                  style={{
                    color: allColors.colorPrimary,
                    fontSize: `${typography.fontSizeHeading4}px`,
                    fontWeight: typography.fontWeightStrong,
                    margin: 0,
                  }}
                >
                  Accesos
                </Title>
                <div className="estudiante-accesos-grid">
                  <DashboardAccesoHubCard
                    icon={<IdcardOutlined />}
                    accent={allColors.colorPrimary}
                    accentBg={allColors.colorPrimaryBg}
                    title="Mis datos"
                    description={resumen(
                      [
                        resumenEstudiante?.carrera,
                        resumenEstudiante?.codigo && `Cód. ${resumenEstudiante.codigo}`,
                        resumenEstudiante?.ci && `C.I. ${resumenEstudiante.ci}`,
                      ],
                      'Consulta tu ficha personal y académica.',
                    )}
                    actionLabel="Ver mis datos"
                    onClick={() => navegarSeguro(PATH_MIS_DATOS)}
                  />
                  <DashboardAccesoHubCard
                    icon={<SolutionOutlined />}
                    accent={allColors.colorInfo}
                    accentBg={allColors.colorInfoBg}
                    title="Mi matrícula"
                    description={resumen(
                      [resumenEstudiante?.carrera],
                      'Revisa tu inscripción y materias.',
                    )}
                    actionLabel="Ver mi matrícula"
                    onClick={() => navegarSeguro(PATH_MATRICULA)}
                  />
                  <DashboardAccesoHubCard
                    icon={<DollarOutlined />}
                    accent={
                      resumenEstudiante?.saldoPendiente > 0
                        ? allColors.colorWarning
                        : allColors.colorSuccess
                    }
                    accentBg={
                      resumenEstudiante?.saldoPendiente > 0
                        ? allColors.colorWarningBg
                        : allColors.colorSuccessBg
                    }
                    title="Mis aportes"
                    description={
                      resumenEstudiante?.saldoPendiente > 0
                        ? `Saldo pendiente: ${formatBsConSimbolo(resumenEstudiante.saldoPendiente)}`
                        : 'Sin saldo pendiente.'
                    }
                    actionLabel="Ver mis aportes"
                    onClick={() => navegarSeguro(PATH_APORTES)}
                  />
                  <DashboardAccesoHubCard
                    icon={<BookOutlined />}
                    accent={allColors.colorPrimary}
                    accentBg={allColors.colorPrimaryBg}
                    title="Mi boletín"
                    description={
                      resumenEstudiante?.promedioGeneral != null
                        ? `Promedio general: ${resumenEstudiante.promedioGeneral}`
                        : 'Consulta tus calificaciones por bimestre y materia.'
                    }
                    actionLabel="Ver mi boletín"
                    onClick={() => navegarSeguro(PATH_BOLETIN)}
                  />
                </div>
              </Flex>
            </>
          ) : esDocente ? (
            /* ── Hub del docente ── */
            <>
              <DetailProfileCard
                avatarInitials={buildInitials(nombreMostrado)}
                avatarClassName="sd-profile__avatar sd-profile__avatar--default"
                title={nombreMostrado}
                subtitle={resumen(
                  ['Docente', lineaValor(vinculoPerfil?.lineas, 'Título profesional')],
                  'Docente',
                )}
                metaExtra={rolPill}
                stats={[
                  { label: 'Cursos', value: resumenDocente?.cursos ?? '—', primary: true },
                  { label: 'Horas semanales', value: resumenDocente?.horasSemanales ?? '—' },
                  { label: 'Gestión', value: resumenDocente?.gestion ?? '—' },
                ]}
              />

              <DetailInfoCard title="Cuenta" icon={<UserOutlined />} cols={2}>
                <DetailField label="Usuario">{usuario.username}</DetailField>
                <DetailField label="Correo">{usuario.email || '—'}</DetailField>
                <DetailField label="Rol">{rolPill ?? '—'}</DetailField>
              </DetailInfoCard>

              <Flex vertical gap={allSpacing.margin}>
                <Title
                  level={4}
                  style={{
                    color: allColors.colorPrimary,
                    fontSize: `${typography.fontSizeHeading4}px`,
                    fontWeight: typography.fontWeightStrong,
                    margin: 0,
                  }}
                >
                  Accesos
                </Title>
                <div className="estudiante-accesos-grid">
                  <DashboardAccesoHubCard
                    icon={<IdcardOutlined />}
                    accent={allColors.colorPrimary}
                    accentBg={allColors.colorPrimaryBg}
                    title="Mi ficha"
                    description="Consulta tus datos personales, formación y condición laboral."
                    actionLabel="Ver mi ficha"
                    onClick={() => navegarSeguro(PATH_MI_FICHA)}
                  />
                  <DashboardAccesoHubCard
                    icon={<BookOutlined />}
                    accent={allColors.colorInfo}
                    accentBg={allColors.colorInfoBg}
                    title="Mis cursos"
                    description={resumen(
                      [
                        resumenDocente?.cursos != null && `${resumenDocente.cursos} cursos`,
                        resumenDocente?.horasSemanales != null &&
                          `${resumenDocente.horasSemanales} h/semana`,
                      ],
                      'Cuaderno de calificaciones por curso y bimestre.',
                    )}
                    actionLabel="Ver mis cursos"
                    onClick={() => navegarSeguro(PATH_MIS_CURSOS)}
                  />
                  <DashboardAccesoHubCard
                    icon={<CarryOutOutlined />}
                    accent={allColors.colorWarning}
                    accentBg={allColors.colorWarningBg}
                    title="Asistencia"
                    description={resumen(
                      [resumenDocente?.bimestreNombre],
                      'Registra la asistencia diaria de tus cursos.',
                    )}
                    actionLabel="Tomar asistencia"
                    onClick={() => navegarSeguro(PATH_ASISTENCIA)}
                  />
                  <DashboardAccesoHubCard
                    icon={<TeamOutlined />}
                    accent={allColors.colorSuccess}
                    accentBg={allColors.colorSuccessBg}
                    title="Mis estudiantes"
                    description="Roster de estudiantes inscritos en tus cursos, por carrera y paralelo."
                    actionLabel="Ver mis estudiantes"
                    onClick={() => navegarSeguro(PATH_MIS_ESTUDIANTES)}
                  />
                  <DashboardAccesoHubCard
                    icon={<CalendarOutlined />}
                    accent={allColors.colorInfo}
                    accentBg={allColors.colorInfoBg}
                    title="Mi horario"
                    description={resumen(
                      [resumenDocente?.gestion],
                      'Tu grilla semanal de clases por curso y aula.',
                    )}
                    actionLabel="Ver mi horario"
                    onClick={() => navegarSeguro(PATH_MI_HORARIO)}
                  />
                </div>
              </Flex>
            </>
          ) : (
            /* ── Perfil estándar (staff/admin) ── */
            <>
              <DetailProfileCard
                avatarInitials={buildInitials(usuario.username)}
                title={usuario.username}
                subtitle={usuario.email || 'Sin correo'}
                metaExtra={rolPill}
                stats={[
                  { label: 'Rol', value: rol?.nombre || '—', primary: true },
                  { label: 'Tipo de rol', value: tipoRol },
                ]}
              />

              <DetailInfoCard title="Cuenta y rol" icon={<UserOutlined />} cols={2}>
                <DetailField label="Usuario">{usuario.username}</DetailField>
                <DetailField label="Correo">{usuario.email || '—'}</DetailField>
                <DetailField label="Rol">{rolPill ?? '—'}</DetailField>
                <DetailField label="Tipo de rol">{tipoRol}</DetailField>
              </DetailInfoCard>

              {vinculoPerfil ? (
                <DetailInfoCard title="Persona / ficha" icon={<IdcardOutlined />} cols={2}>
                  <DetailField label="Vinculación">
                    <Tag color="blue">{vinculoPerfil.tipo_etiqueta}</Tag>
                    <strong style={{ marginLeft: 8 }}>{vinculoPerfil.nombre_completo}</strong>
                  </DetailField>
                  {(vinculoPerfil.lineas || []).map((ln, idx) => (
                    <DetailField key={`${ln.etiqueta}-${idx}`} label={ln.etiqueta}>
                      {ln.valor || '—'}
                    </DetailField>
                  ))}
                </DetailInfoCard>
              ) : null}
            </>
          )
        ) : null}
      </DetailPageShell>

      <CambiarMiPasswordModal
        open={openPass}
        loading={saving}
        onCancel={() => setOpenPass(false)}
        onSubmit={cambiarPassword}
      />
    </PageTemplate>
  );
}
