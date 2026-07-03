/**
 * DocenteDashboard — página de inicio del rol DOCENTE.
 *
 * Dashboard POR ROL: vive a nivel de `dashboard/pages/` igual que el `Dashboard`
 * administrativo y el `EstudianteDashboard`; el `DashboardConnector` elige la
 * página según el rol. Reusa el mismo esqueleto visual: `DashboardPageShell`
 * (Flex 70/30) con `MainContent` + `InfoSidebar` y las moléculas del dashboard.
 *
 *  - MainContent: bienvenida (gestión/bimestre vigente) → accesos rápidos
 *    (Mi perfil, Mis cursos, Asistencia, Mi ficha) → "Mis cursos" (lista) →
 *    "Mi horario semanal" (grilla reutilizada de la ficha docente).
 *  - InfoSidebar: KPIs de carga académica (cursos, horas semanales, estudiantes).
 *
 * SOLO LECTURA / navegación. Datos vía `useDocenteHome`
 * (GET /dashboard/mi-resumen-docente; identidad resuelta en servidor).
 */

import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Empty, Flex, Spin, Typography } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  BookOutlined,
  CarryOutOutlined,
} from '@ant-design/icons';
import { allColors, allSpacing, componentConfig, shadows, typography } from '@theme/tokens';
import { MainContent, InfoSidebar } from '@templates';
import { useDocenteHome } from '@application-dashboard/hooks/useDocenteHome.js';
import DashboardPageShell from '@dashboard/components/organisms/DashboardPageShell';
import DashboardWelcomeBanner from '@dashboard/components/molecules/DashboardWelcomeBanner';
import DashboardEstudiantesResumenCard from '@dashboard/components/molecules/DashboardEstudiantesResumenCard';
import DashboardAccesoHubCard from '@dashboard/components/molecules/DashboardAccesoHubCard';
import DashboardCursosDocenteCard from '@dashboard/components/molecules/DashboardCursosDocenteCard';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
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
  const { docente, gestion, carga, cursos, horarioCursos, totalEstudiantes, loading, error, refetch } =
    useDocenteHome();

  /** Navega solo a rutas internas seguras. */
  const navegarSeguro = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigate(path);
    }
  };

  // Banner: descripción personalizada con la gestión/bimestre vigente (si llegan).
  const gestionLabel = [gestion.nombre, gestion.bimestreNombre].filter(Boolean).join(' · ');
  const bannerDescription = gestionLabel
    ? `Estás dictando clases en la ${gestionLabel} del Instituto INCOS. ${TEXTO_INSTITUCIONAL}`
    : TEXTO_INSTITUCIONAL;

  return (
    <DashboardPageShell>
      <MainContent>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            {error ? (
              <Alert
                type="warning"
                showIcon
                title="No se pudo cargar tu resumen en vivo"
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
                  description="Revisa tu cuenta y cambia tu contraseña."
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
                  description="Registra la asistencia diaria de tus cursos."
                  actionLabel="Tomar asistencia"
                  onClick={() => navegarSeguro(PATH_ASISTENCIA)}
                />
                <DashboardAccesoHubCard
                  icon={<IdcardOutlined />}
                  accent={allColors.colorSuccess}
                  accentBg={allColors.colorSuccessBg}
                  title="Mi ficha"
                  description="Consulta tus datos personales y laborales."
                  actionLabel="Ver mi ficha"
                  onClick={() => navegarSeguro(PATH_MI_FICHA)}
                />
              </div>
            </Flex>

            <DashboardCursosDocenteCard cursos={cursos} />

            <Flex vertical gap={allSpacing.margin}>
              <SectionTitle>Mi horario semanal</SectionTitle>
              <Card
                style={{
                  borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                  boxShadow: shadows.shadowElevation2,
                  border: `1px solid ${allColors.colorBorder}`,
                  backgroundColor: allColors.colorBgContainer,
                }}
                styles={{ body: { padding: `${allSpacing.margin}px` } }}
              >
                {horarioCursos.length > 0 ? (
                  <DocenteHorarioSemanalGrid courseSchedules={horarioCursos} />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Aún no tienes bloques de horario publicados en la gestión vigente."
                  />
                )}
              </Card>
            </Flex>
          </Flex>
        </Spin>
      </MainContent>

      <InfoSidebar>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            <DashboardEstudiantesResumenCard
              title="Mi carga académica"
              lines={[
                { label: 'Cursos', value: carga.totalAsignaciones },
                { label: 'Horas semanales', value: carga.horasSemanales },
                { label: 'Estudiantes', value: totalEstudiantes },
              ]}
            />
          </Flex>
        </Spin>
      </InfoSidebar>
    </DashboardPageShell>
  );
};

export default DocenteDashboard;
