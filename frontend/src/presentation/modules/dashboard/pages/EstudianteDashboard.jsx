/**
 * EstudianteDashboard — página de inicio del rol ESTUDIANTE.
 *
 * Dashboard POR ROL: vive a nivel de `dashboard/pages/` igual que el `Dashboard`
 * administrativo, y el `DashboardConnector` elige la página según el rol. Así el
 * sistema soporta más de un dashboard (admin, estudiante, y a futuro docente) sin
 * mezclar lógicas. Reusa el mismo esqueleto visual del admin: `DashboardPageShell`
 * (Flex 70/30) con `MainContent` + `InfoSidebar` y las moléculas del dashboard.
 *
 *  - MainContent: bienvenida → accesos rápidos (Mi perfil, Mis datos, Mi boletín)
 *    → "Mis docentes" (lista compacta).
 *  - InfoSidebar: "Mis aportes" (saldo) → "Mis sesiones" → "Actividades recientes".
 *
 * SOLO LECTURA / navegación. Datos vía `useEstudianteHome` (GET /dashboard/mi-resumen).
 */

import { useNavigate } from 'react-router-dom';
import { Alert, Flex, Spin, Typography } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  FileTextOutlined,
  BookOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { MainContent, InfoSidebar } from '@templates';
import { useEstudianteHome } from '@application-dashboard/hooks/useEstudianteHome.js';
import DashboardPageShell from '@dashboard/components/organisms/DashboardPageShell';
import DashboardWelcomeBanner from '@dashboard/components/molecules/DashboardWelcomeBanner';
import DashboardEstudiantesResumenCard from '@dashboard/components/molecules/DashboardEstudiantesResumenCard';
import DashboardActividadesRecientesCard from '@dashboard/components/molecules/DashboardActividadesRecientesCard';
import DashboardAccesoHubCard from '@dashboard/components/molecules/DashboardAccesoHubCard';
import DashboardDocentesListCard from '@dashboard/components/molecules/DashboardDocentesListCard';
import DashboardMiSaldoCard from '@dashboard/components/molecules/DashboardMiSaldoCard';
import '@dashboard/styles/estudiante-home.css';

const { Title } = Typography;

/** Texto institucional del banner (compartido con el dashboard admin). */
const TEXTO_INSTITUCIONAL =
  'Formamos profesionales competentes en Administración de Empresas, Contaduría y ' +
  'Sistemas Informáticos. Únase a nuestra comunidad educativa y construya su futuro profesional.';

/** Rutas internas del portal del estudiante. */
const PATH_APORTES = '/matricula/aportes/listar';
const PATH_PERFIL = '/perfil';
const PATH_BOLETIN = '/academico/mi-boletin';
const PATH_MIS_DATOS = '/estudiantes/listar';
const PATH_MI_PROYECTO = '/tutorias/mi-proyecto';
const PATH_MI_PASANTIA = '/tutorias/mi-pasantia';

const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const { estudiante, carrera, docentes, actividades, stats, saldoPendiente, loading, error } =
    useEstudianteHome();

  /** Navega solo a rutas internas seguras. */
  const navegarSeguro = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigate(path);
    }
  };

  // Banner: título + descripción personalizada con su carrera (si la tiene).
  const bannerDescription = carrera?.label
    ? `Está cursando ${carrera.label} en el Instituto INCOS. ${TEXTO_INSTITUCIONAL}`
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
                title="No se pudo cargar su resumen en vivo"
                description={error}
              />
            ) : null}

            <DashboardWelcomeBanner
              title={`Hola, ${estudiante.nombre}`}
              description={bannerDescription}
              showVerCarreras={false}
              showRegistrarEstudiante={false}
            />

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
                Accesos rápidos
              </Title>
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
                  icon={<IdcardOutlined />}
                  accent={allColors.colorInfo}
                  accentBg={allColors.colorInfoBg}
                  title="Mis datos"
                  description="Consulte su ficha personal y académica."
                  actionLabel="Ver mis datos"
                  onClick={() => navegarSeguro(PATH_MIS_DATOS)}
                />
                <DashboardAccesoHubCard
                  icon={<FileTextOutlined />}
                  accent={allColors.colorWarning}
                  accentBg={allColors.colorWarningBg}
                  title="Mi boletín"
                  description="Consulte sus calificaciones por bimestre y materia."
                  actionLabel="Ver mi boletín"
                  onClick={() => navegarSeguro(PATH_BOLETIN)}
                />
                <DashboardAccesoHubCard
                  icon={<BookOutlined />}
                  accent={allColors.colorSuccess}
                  accentBg={allColors.colorSuccessBg}
                  title="Mi proyecto de grado"
                  description="Consulte su proyecto, la bitácora de tutoría y suba sus avances."
                  actionLabel="Ver mi proyecto"
                  onClick={() => navegarSeguro(PATH_MI_PROYECTO)}
                />
                <DashboardAccesoHubCard
                  icon={<ShopOutlined />}
                  accent={allColors.colorInfo}
                  accentBg={allColors.colorInfoBg}
                  title="Mi pasantía"
                  description="Consulte su trámite de práctica laboral, informes y seguimientos."
                  actionLabel="Ver mi pasantía"
                  onClick={() => navegarSeguro(PATH_MI_PASANTIA)}
                />
              </div>
            </Flex>

            <DashboardDocentesListCard docentes={docentes} />
          </Flex>
        </Spin>
      </MainContent>

      <InfoSidebar>
        <Spin spinning={loading}>
          <Flex vertical gap="large">
            <DashboardMiSaldoCard
              saldoPendiente={saldoPendiente}
              onVerAportes={() => navegarSeguro(PATH_APORTES)}
            />
            <DashboardEstudiantesResumenCard
              title="Mis sesiones"
              todayLabel="Hoy"
              monthLabel="Este mes"
              unidad="sesiones"
              todayCount={stats.sesionesHoy}
              monthCount={stats.sesionesMes}
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

export default EstudianteDashboard;
