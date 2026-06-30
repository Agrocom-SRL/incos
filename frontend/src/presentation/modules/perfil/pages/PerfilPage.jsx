/**
 * PerfilPage — "Mi perfil".
 *
 * Dos comportamientos según el rol:
 *  - NO estudiantes: ficha de cuenta/rol + persona/ficha (igual que siempre).
 *  - ESTUDIANTE: hub de portal — cabecera compacta + tarjeta de cuenta + una grilla
 *    de accesos (resumen + navegación) a Mis datos, Mi matrícula, Mis aportes y Mi
 *    boletín. SOLO LECTURA salvo "Cambiar contraseña" (self-service).
 */

import { useNavigate } from 'react-router-dom';
import {
  BookOutlined,
  DollarOutlined,
  IdcardOutlined,
  LockOutlined,
  SolutionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Flex, Tag, Typography } from 'antd';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { DetailField, Button } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';
import { formatBsConSimbolo } from '@application/utils/formatters';
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

/** Iniciales para el avatar (máx. 2 letras) a partir de un nombre o username. */
function iniciales(texto) {
  const partes = String(texto || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '—';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

/** Une partes de un resumen omitiendo las ausentes; cae a un texto guía. */
function resumen(partes, fallback) {
  const texto = partes.filter(Boolean).join(' · ');
  return texto || fallback;
}

export default function PerfilPage() {
  const navigate = useNavigate();
  const {
    usuario,
    loading,
    vinculoPerfil,
    esEstudiante,
    resumenEstudiante,
    openPass,
    saving,
    breadcrumbItems,
    setOpenPass,
    cambiarPassword,
  } = usePerfilPageContext();

  const rol = usuario?.rol;
  const tipoRol = !rol ? '—' : rol.is_system ? 'Sistema' : 'Personalizado';

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
                avatarInitials={iniciales(nombreMostrado)}
                avatarClassName="sd-profile__avatar sd-profile__avatar--default"
                title={nombreMostrado}
                subtitle={correo}
                metaExtra={<Tag color="green">Estudiante</Tag>}
              />

              <DetailInfoCard title="Cuenta" icon={<UserOutlined />} cols={2}>
                <DetailField label="Usuario">{usuario.username}</DetailField>
                <DetailField label="Correo">{usuario.email || '—'}</DetailField>
                <DetailField label="Rol">{rol?.nombre || '—'}</DetailField>
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
          ) : (
            /* ── Perfil estándar (no estudiantes) ── */
            <>
              <DetailProfileCard
                avatarInitials={iniciales(usuario.username)}
                title={usuario.username}
                subtitle={usuario.email || 'Sin correo'}
                metaExtra={rol?.nombre ? <Tag color="green">{rol.nombre}</Tag> : null}
                stats={[
                  { label: 'Rol', value: rol?.nombre || '—', primary: true },
                  { label: 'Tipo de rol', value: tipoRol },
                ]}
              />

              <DetailInfoCard title="Cuenta y rol" icon={<UserOutlined />} cols={2}>
                <DetailField label="Usuario">{usuario.username}</DetailField>
                <DetailField label="Correo">{usuario.email || '—'}</DetailField>
                <DetailField label="Rol">{rol?.nombre || '—'}</DetailField>
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
