/**
 * DocenteDashboard — página de inicio del rol DOCENTE.
 *
 * Dashboard POR ROL: vive a nivel de `dashboard/pages/` igual que el `Dashboard`
 * administrativo y el `EstudianteDashboard`; el `DashboardConnector` elige la
 * página según el rol. Reusa el mismo esqueleto visual: `DashboardPageShell`
 * (Flex 70/30) con `MainContent` + `InfoSidebar` y las moléculas del dashboard.
 *
 *  - MainContent: bienvenida (gestión/bimestre vigente) → accesos rápidos
 *    (Mi perfil, Mis cursos, Asistencia, Mi ficha) → "Mis cursos" agrupados por
 *    carrera → periodo (con acceso a "Mis asignaciones") → "Mis estudiantes"
 *    (roster por curso en tabs por carrera + chips por curso).
 *  - InfoSidebar: "Mis sesiones" (hoy/mes) → acceso "Mi horario" → actividades.
 *
 * SOLO LECTURA / navegación. Datos vía `useDocenteHome`
 * (GET /dashboard/mi-resumen-docente; identidad resuelta en servidor) y
 * `useMisEstudiantesDocente` (GET /docentes/mis-estudiantes).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Empty, Flex, Spin, Typography } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  BookOutlined,
  CarryOutOutlined,
  CalendarOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { MainContent, InfoSidebar } from '@templates';
import { useDocenteHome } from '@application-dashboard/hooks/useDocenteHome.js';
import { useMisEstudiantesDocente } from '@application-dashboard/hooks/useMisEstudiantesDocente.js';
import { useMiDocenteId } from '@application-docentes/hooks/api/useMiDocenteId.js';
import { ofertaPaths } from '@application-institucional/oferta/config/paths';
import { ActionButton } from '@atoms';
import { ListPanelHeader } from '@molecules';
import { CarreraTabsListView } from '@organisms';
import DashboardPageShell from '@dashboard/components/organisms/DashboardPageShell';
import DashboardWelcomeBanner from '@dashboard/components/molecules/DashboardWelcomeBanner';
import DashboardEstudiantesResumenCard from '@dashboard/components/molecules/DashboardEstudiantesResumenCard';
import DashboardActividadesRecientesCard from '@dashboard/components/molecules/DashboardActividadesRecientesCard';
import DashboardAccesoHubCard from '@dashboard/components/molecules/DashboardAccesoHubCard';
import DashboardCursosDocenteCard from '@dashboard/components/molecules/DashboardCursosDocenteCard';
import { createMisEstudiantesDocenteColumns } from '@dashboard/config/misEstudiantesDocenteColumns';
import '@dashboard/styles/estudiante-home.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Title, Paragraph } = Typography;

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

/** Accessor de carrera del roster (campos planos de /docentes/mis-estudiantes). */
const getCarreraEstudiante = (record) => ({
  nombre: record.carreraNombre || null,
  codigo: record.carreraCodigo || null,
  colorHex: record.carreraColorHex || null,
});

/** Segundo nivel: CURSO (materia · paralelo) como chips dentro de cada carrera. */
const subGroupCurso = {
  allLabel: 'Todos',
  sinLabel: 'Sin curso',
  getSubgrupo: (record) => {
    if (record.ofertaCursoId == null && !record.materiaSigla) return null;
    return {
      id: record.ofertaCursoId ?? null,
      nombre:
        [record.materiaSigla, record.paraleloNombre].filter(Boolean).join(' · ') || 'Curso',
      // Mismo color para la misma materia en todas las carreras.
      colorKey: record.materiaSigla || null,
    };
  },
};

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
  const roster = useMisEstudiantesDocente();
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
    ? `Estás dictando clases en la ${gestionLabel} del Instituto INCOS. ${TEXTO_INSTITUCIONAL}`
    : TEXTO_INSTITUCIONAL;

  // Rama docente de llegada a Oferta → Asignaciones: SIEMPRE su propio id
  // (resuelto en servidor por useMiDocenteId; el backend restringe la vista).
  const handleMisAsignaciones = () => {
    if (miDocenteId) {
      navegarSeguro(ofertaPaths.docenteAsignaciones(miDocenteId));
    }
  };

  const misAsignacionesAction = (
    <ActionButton
      permiso="docentes.ver"
      accion="LISTAR"
      variant="default"
      size="small"
      icon={<SolutionOutlined />}
      loading={miIdLoading}
      disabled={!miIdLoading && !miDocenteId}
      onClick={handleMisAsignaciones}
    >
      Mis asignaciones
    </ActionButton>
  );

  const misEstudiantesColumns = useMemo(
    () => createMisEstudiantesDocenteColumns(navigate),
    [navigate],
  );

  const rosterVacio = !roster.loading && !roster.error && roster.totalEstudiantes === 0;

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

            {/* Cursos agrupados por carrera → periodo + acceso a Mis asignaciones. */}
            <DashboardCursosDocenteCard cursos={cursos} headerAction={misAsignacionesAction} />

            {/* Roster de estudiantes por curso (tabs por carrera + chips por curso). */}
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Mis estudiantes" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Estudiantes matriculados en tus cursos
                  {roster.gestion.nombre ? ` de la ${roster.gestion.nombre}` : ' de la gestión vigente'}
                  . Un mismo estudiante puede aparecer en más de un curso.
                </Paragraph>
              </header>
              {roster.error ? (
                <Alert
                  type="warning"
                  showIcon
                  title="No se pudo cargar tu lista de estudiantes"
                  description={roster.error}
                  action={
                    <Button size="small" onClick={roster.refetch}>
                      Reintentar
                    </Button>
                  }
                />
              ) : rosterVacio ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Aún no tienes estudiantes en la gestión vigente."
                />
              ) : (
                <CarreraTabsListView
                  rows={roster.estudiantes}
                  getCarrera={getCarreraEstudiante}
                  subGroup={subGroupCurso}
                  loading={roster.loading}
                  error={roster.error}
                  searchText={roster.searchText}
                  onSearchChange={(e) => roster.setSearchText(e.target.value)}
                  searchPlaceholder="Buscar por estudiante, código, C.I., materia..."
                  columns={misEstudiantesColumns}
                  rowKey={(record) => record.rowKey}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  loadingTip="Cargando estudiantes..."
                />
              )}
            </section>
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
              description="Tu calendario semanal de clases en la gestión vigente."
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
