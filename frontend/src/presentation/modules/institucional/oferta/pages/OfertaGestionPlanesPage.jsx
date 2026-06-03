import { Alert, Flex, Spin, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useOfertaGestionPlanesState } from '@application-institucional/oferta';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@configuracion/academico/styles/academico-form-page.css';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';
import { OfertaGestionPlanTabPanel } from '../components';

const { Paragraph } = Typography;

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const OfertaGestionPlanesPage = () => {
  const s = useOfertaGestionPlanesState();

  const tabItems = s.tabItems.map(({ key, label, plan }) => ({
    key,
    label: (
      <span className="sd-tab-label">
        <BookOutlined /> {label}
      </span>
    ),
    children: wrapTabPanel(
      <OfertaGestionPlanTabPanel
        loading={s.paralelosLoadingPlanId === plan.id}
        plan={plan}
        paralelos={s.paralelosByPlanId[plan.id] ?? []}
        coberturaByParaleloId={s.coberturaByParaleloId}
        soloConsulta={!s.puedeEditarOferta}
        inhabilitandoParaleloId={s.inhabilitandoParaleloId}
        onInhabilitarParalelo={s.onInhabilitarParalelo}
        onHabilitarParalelo={s.onHabilitarParalelo}
        onNavigateDetalle={s.onNavigateDetalle}
      />
    ),
  }));

  const showWorkspace = s.planesHabilitados.length > 0;
  const showGenerarParalelos = s.puedeEditarOferta && showWorkspace && s.planSeleccionado;
  const contextAlert = s.gestionContextAlert;

  return (
    <Flex vertical gap="large" className="page-container oferta-gestion-planes-page" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap="small" className="oferta-gestion-planes-page__header-actions">
              <ActionButton
                permiso="institucional.oferta.gestion-plan"
                accion="LISTAR"
                variant="back"
                icon={<ArrowLeftOutlined />}
                onClick={s.navigateBack}
              >
                volver
              </ActionButton>
              {showGenerarParalelos ? (
                <ActionButton
                  permiso="institucional.oferta.paralelo-gestion"
                  accion="CREAR"
                  variant="primary"
                  icon={<TeamOutlined />}
                  loading={s.generandoParalelos}
                  onClick={s.onGenerarParalelos}
                >
                  Generar paralelos
                </ActionButton>
              ) : null}
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.planesLoading} tip="Cargando planes...">
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
              {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

              {contextAlert ? (
                <Alert
                  type={contextAlert.type}
                  showIcon
                  message={contextAlert.message}
                  description={contextAlert.description}
                  action={
                    contextAlert.showIrGestionVigente ? (
                      <ActionButton
                        permiso="institucional.oferta.gestion-plan"
                        accion="LISTAR"
                        size="small"
                        variant="primary"
                        onClick={s.navigateGestionVigente}
                      >
                        volver
                      </ActionButton>
                    ) : null
                  }
                />
              ) : null}

              {showWorkspace ? (
                <section className="cfg-academico-workspace">
                  <header className="cfg-academico-workspace__header">
                    <ListPanelHeader
                      title={
                        s.gestionSeleccionada
                          ? (s.gestionSeleccionada.codigo ??
                            s.gestionSeleccionada.nombre ??
                            'Gestión')
                          : 'Gestión'
                      }
                    />
                    <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                      {s.puedeEditarOferta
                        ? 'Paralelos de la gestión por plan habilitado. «Generar paralelos» crea instancias y las materias del periodo en un solo paso. Aula, docentes y horarios se completan en la ficha de cada paralelo.'
                        : 'Consulta histórica de paralelos por plan habilitado en esta gestión.'}
                    </Paragraph>
                  </header>

                  <div className="sd-tabs-shell cfg-academico-tabs-shell">
                    <Tabs
                      className="sd-tabs cfg-academico-workspace__tabs"
                      activeKey={s.activePlanKey}
                      items={tabItems}
                      onChange={s.onTabChange}
                      destroyOnHidden={false}
                    />
                  </div>
                </section>
              ) : null}
            </Flex>
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default OfertaGestionPlanesPage;
