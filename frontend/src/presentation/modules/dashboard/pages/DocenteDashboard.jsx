/**
 * DocenteDashboard — página de inicio del rol DOCENTE.
 *
 * Dashboard POR ROL: vive a nivel de `dashboard/pages/` igual que el `Dashboard`
 * administrativo y el `EstudianteDashboard`; el `DashboardConnector` elige la
 * página según el rol. Reusa el mismo esqueleto visual: `DashboardPageShell`
 * (Flex 70/30) con `MainContent` + `InfoSidebar` y las moléculas del dashboard.
 *
 *  - MainContent: bienvenida (gestión/bimestre vigente) → accesos rápidos
 *    (Mi perfil, Mis cursos, Asistencia, Mis estudiantes, Mi ficha) →
 *    "Mis cursos" agrupados por carrera → periodo (con acceso a "Mis asignaciones").
 *  - InfoSidebar: "Mis sesiones" (hoy/mes) → acceso "Mi horario" → actividades.
 *
 * El roster "Mis estudiantes" vive en el ítem de menú Matrículas
 * (`MisEstudiantesDocentePage`, rama docente del ListConnector) — aquí solo se
 * enlaza. SOLO LECTURA / navegación. Datos vía `useDocenteHome`
 * (GET /dashboard/mi-resumen-docente; identidad resuelta en servidor).
 */

import { useNavigate } from 'react-router-dom';
import { Alert, Button, Flex, Spin, Typography } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  BookOutlined,
  CarryOutOutlined,
  CalendarOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { MainContent, InfoSidebar } from '@templates';
import { useDocenteHome } from '@application-dashboard/hooks/useDocenteHome.js';
import { useMiDocenteId } from '@application-docentes/hooks/api/useMiDocenteId.js';
import { ofertaPaths } from '@application-institucional/oferta/config/paths';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@dashboard/components/organisms/DashboardPageShell';
import DashboardWelcomeBanner from '@dashboard/components/molecules/DashboardWelcomeBanner';
import DashboardEstudiantesResumenCard from '@dashboard/components/molecules/DashboardEstudiantesResumenCard';
import DashboardActividadesRecientesCard from '@dashboard/components/molecules/DashboardActividadesRecientesCard';
import DashboardAccesoHubCard from '@dashboard/components/molecules/DashboardAccesoHubCard';
import DashboardCursosDocenteCard from '@dashboard/components/molecules/DashboardCursosDocenteCard';
import '@dashboard/styles/estudiante-home.css';

const { Title } = Typography;

/** Texto institucional del banner (compartido con el dashboard admin). */
const TEXTO_INSTITUCIONAL =
  'Formamos profesionales competentes en Administración de Empresas, Contaduría y ' +
  'Sistemas Informáticos. Gracias por ser parte de nuestra comunidad educativa.';

/** Rutas internas del portal del docente. */
const PATH_PERFIL = '/perfil';
const PATH_MIS_CURSOS = '/academico/calificaciones';
const PATH_ASISTENCIA = '/academico/asistencia';
const PATH_MI_FICHA = '/docentes/listar';
const PATH_MI_HORARIO = '/docentes/mi-horario';
const PATH_MIS_ESTUDIANTES = '/matricula/listar';

/** Título de sección del inicio (mismo lenguaje que EstudianteDashboard). */
const SectionTitle = ({ children }) => (
  <Title
    level={4}
    style={{
      color: allColors.colorPrimary,
      fontSize: `${typography.fontSizeHeading4}px`,
      fontWeight: typography.fontWeightStrong,
      margin: 0,
    }}
  >
    {children}
  </Title>
);

const DocenteDashboard = () => {
  const navigate = useNavigate();
  const { docente, gestion, cursos, stats, actividades, loading, error, refetch } =
    useDocenteHome();
  const { docenteId: miDocenteId, loading: miIdLoading } = useMiDocenteId();

  /** Navega solo a rutas internas seguras. */
  const navegarSeguro = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigate(path);
    }
  };

  // Banner: descripción personalizada con la gestión/bimestre vigente (si llegan).
  const gestionLabel = [gestion.nombre, gestion.bimestreNombre].filter(Boolean).join(' · ');
  const bannerDescription = gestionLabel
    ? `Está dictando clases en el Instituto INCOS (${gestionLabel}). ${TEXTO_INSTITUCIONAL}`
    : TEXTO_INSTITUCIONAL;

  // Rama docente de llegada a Oferta → Asignaciones: SIEMPRE su propio id
  // (resuelto en servidor por useMiDocenteId; el backend restringe la vista).
  const handleMisAsignaciones = () => {
    if (miDocenteId) {
      // Mismo destino que el ítem de menú "Mis asignaciones" (Institucional);
      // returnListPath para que el "Volver" de la página regrese al inicio.
      navigate(ofertaPaths.docenteAsignaciones(miDocenteId), {
        state: { returnListPath: '/dashboard' },
      });
    }
  };

  const misAsignacionesAction = (
    <ActionButton
      permiso="docentes.ver"
      accion="LISTAR"
      variant="primary"
      size="small"
      icon={<SolutionOutlined />}
      loading={miIdLoading}
      disabled={!miIdLoading && !miDocenteId}
      onClick={handleMisAsignaciones}
    >
      Mis asignaciones
    </ActionButton>
  );

  return (
    <DashboardPageShell>
      <MainContent>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            {error ? (
              <Alert
                type="warning"
                showIcon
                title="No se pudo cargar su resumen en vivo"
                description={error}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
              />
            ) : null}

            <DashboardWelcomeBanner
              title={`Hola, ${docente.nombre}`}
              description={bannerDescription}
              showVerCarreras={false}
              showRegistrarEstudiante={false}
            />

            <Flex vertical gap={allSpacing.margin}>
              <SectionTitle>Accesos rápidos</SectionTitle>
              <div className="estudiante-accesos-grid">
                <DashboardAccesoHubCard
                  icon={<UserOutlined />}
                  accent={allColors.colorPrimary}
                  accentBg={allColors.colorPrimaryBg}
                  title="Mi perfil"
                  description="Revise su cuenta y cambie su contraseña."
                  actionLabel="Ir a mi perfil"
                  onClick={() => navegarSeguro(PATH_PERFIL)}
                />
                <DashboardAccesoHubCard
                  icon={<BookOutlined />}
                  accent={allColors.colorInfo}
                  accentBg={allColors.colorInfoBg}
                  title="Mis cursos"
                  description="Cuaderno de calificaciones por curso y bimestre."
                  actionLabel="Ver mis cursos"
                  onClick={() => navegarSeguro(PATH_MIS_CURSOS)}
                />
                <DashboardAccesoHubCard
                  icon={<CarryOutOutlined />}
                  accent={allColors.colorWarning}
                  accentBg={allColors.colorWarningBg}
                  title="Asistencia"
                  description="Registre la asistencia diaria de sus cursos."
                  actionLabel="Tomar asistencia"
                  onClick={() => navegarSeguro(PATH_ASISTENCIA)}
                />
                <DashboardAccesoHubCard
                  icon={<TeamOutlined />}
                  accent={allColors.colorAccent}
                  accentBg={allColors.colorAccentBg}
                  title="Mis estudiantes"
                  description="Lista de estudiantes por curso en la gestión vigente."
                  actionLabel="Ver mis estudiantes"
                  onClick={() => navegarSeguro(PATH_MIS_ESTUDIANTES)}
                />
                <DashboardAccesoHubCard
                  icon={<IdcardOutlined />}
                  accent={allColors.colorSuccess}
                  accentBg={allColors.colorSuccessBg}
                  title="Mi ficha"
                  description="Consulte sus datos personales y laborales."
                  actionLabel="Ver mi ficha"
                  onClick={() => navegarSeguro(PATH_MI_FICHA)}
                />
              </div>
            </Flex>

            {/* Cursos agrupados por carrera → periodo + acceso a Mis asignaciones. */}
            <DashboardCursosDocenteCard cursos={cursos} headerAction={misAsignacionesAction} />
          </Flex>
        </Spin>
      </MainContent>

      <InfoSidebar>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            <DashboardEstudiantesResumenCard
              title="Mis sesiones"
              todayLabel="Hoy"
              monthLabel="Este mes"
              unidad="sesiones"
              todayCount={stats.sesionesHoy}
              monthCount={stats.sesionesMes}
            />
            <DashboardAccesoHubCard
              icon={<CalendarOutlined />}
              accent={allColors.colorInfo}
              accentBg={allColors.colorInfoBg}
              title="Mi horario"
              description="Su calendario semanal de clases en la gestión vigente."
              actionLabel="Ver mi horario"
              onClick={() => navegarSeguro(PATH_MI_HORARIO)}
            />
            <DashboardActividadesRecientesCard
              actividades={actividades}
              onRowNavigate={navegarSeguro}
            />
          </Flex>
        </Spin>
      </InfoSidebar>
    </DashboardPageShell>
  );
};

export default DocenteDashboard;
