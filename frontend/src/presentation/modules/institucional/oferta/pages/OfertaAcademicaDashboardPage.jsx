import { CalendarOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Alert, Flex, Spin, Typography } from 'antd';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useOfertaAcademicaDashboardState } from '@application-institucional/oferta';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';
import {
  OfertaAlertBanner,
  OfertaDashboardKpiStrip,
  OfertaDashboardQuickAccess,
  OfertaSidebarResumen,
} from '../components';

const { Text } = Typography;

const OfertaAcademicaDashboardPage = () => {
  const s = useOfertaAcademicaDashboardState();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica' },
  ];

  const showAlert =
    !s.gestionVigente?.vigente ||
    (s.setupKpis.planesHabilitadosLoaded && s.setupKpis.sinPlanes > 0);

  return (
    <Flex vertical gap="large" className="page-container oferta-dashboard-page" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end">
              <ActionButton
                permiso="institucional.gestion.pasadas"
                accion="LISTAR"
                variant="warning"
                icon={<CalendarOutlined />}
                onClick={s.navigateGestiones}
              >
                Gestiones
              </ActionButton>
              <ActionButton
                permiso="institucional.gestion.horarios"
                accion="LISTAR"
                variant="success"
                icon={<ScheduleOutlined />}
                onClick={s.navigateHorarios}
              >
                Horarios
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.apiLoading} tip="Cargando resumen...">
            <Flex vertical gap={allSpacing.marginLG} className="oferta-dashboard-main">
              {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

              {showAlert ? (
                <OfertaAlertBanner
                  step={s.gestionVigente?.vigente ? 1 : 0}
                  kpis={s.setupKpis}
                  gestionVigente={s.gestionVigente?.vigente}
                />
              ) : (
                <Text type="secondary" className="oferta-dashboard-lead">
                  Configure planes y paralelos en la gestión vigente; luego asigne docentes y arme horarios.
                </Text>
              )}

              <OfertaDashboardKpiStrip kpis={s.dashboardKpis} />

              <OfertaDashboardQuickAccess
                gestionVigente={s.gestionVigente}
                planesHabilitados={s.planesHabilitados}
                sinPlanesHabilitados={s.sinPlanesHabilitados}
                habilitandoPlanes={s.habilitandoPlanes}
                onPlanesVigente={s.navigatePlanesVigente}
                onHabilitarTodosPlanes={s.onHabilitarTodosPlanes}
                onParalelosPlan={s.navigateParalelosPlan}
              />
            </Flex>
          </Spin>
        </MainContent>

        <InfoSidebar>
          <OfertaSidebarResumen
            variant="dashboard"
            gestionSeleccionada={s.gestionVigente}
            dashboardStats={s.dashboardSidebarStats}
          />
        </InfoSidebar>
      </DashboardPageShell>
    </Flex>
  );
};

export default OfertaAcademicaDashboardPage;
