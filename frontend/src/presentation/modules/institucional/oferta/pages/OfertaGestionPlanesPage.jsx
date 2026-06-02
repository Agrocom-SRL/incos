import { Alert, Flex, Modal, Select, Spin, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, BookOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
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
        paralelos={s.paralelosVisiblesByPlanId[plan.id] ?? []}
        totalParalelosGestion={(s.paralelosByPlanId[plan.id] ?? []).length}
        coberturaByParaleloId={s.coberturaByParaleloId}
        soloConsulta={!s.puedeEditarOferta}
        onNavigateDetalle={s.onNavigateDetalle}
      />
    ),
  }));

  const showWorkspace = s.planesHabilitados.length > 0;
  const showHeaderHabilitar =
    s.puedeHabilitarPlan && s.planesPendientesHabilitar.length > 0;
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
                    contextAlert.showHabilitarPlan ? (
                      <ActionButton
                        variant="error"
                        permiso="institucional.oferta.gestion-plan"
                        accion="CREAR"
                        onClick={s.openHabilitarPlanModal}
                      >
                        Habilitar plan
                      </ActionButton>
                    ) : contextAlert.showIrGestionVigente ? (
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
                      actions={
                        showHeaderHabilitar ? (
                          <ActionButton
                            permiso="institucional.oferta.gestion-plan"
                            accion="CREAR"
                            variant="primary"
                            icon={<PlusOutlined />}
                            onClick={s.openHabilitarPlanModal}
                          >
                            Habilitar plan
                          </ActionButton>
                        ) : null
                      }
                    />
                    <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                      {s.puedeEditarOferta
                        ? 'Resumen de paralelos ofertados por plan habilitado. «Generar paralelos» crea instancias en todos los planes habilitados desde las plantillas del catálogo. El detalle operativo (aula, oferta, docentes) se gestiona en la ficha de cada paralelo.'
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

      {s.puedeHabilitarPlan ? (
        <Modal
          title="Habilitar plan de estudio"
          open={s.modalHabilitarPlan}
          onCancel={() => s.setModalHabilitarPlan(false)}
          footer={null}
          destroyOnHidden
        >
          <Select
            showSearch
            placeholder="Seleccione un plan vigente del catálogo"
            style={{ width: '100%' }}
            optionFilterProp="label"
            options={s.planesPendientesHabilitar.map((p) => ({
              value: p.id,
              label: s.planCatalogoLabel(p),
            }))}
            onChange={(planId) => {
              if (planId != null) s.onHabilitarPlan(planId);
            }}
          />
        </Modal>
      ) : null}
    </Flex>
  );
};

export default OfertaGestionPlanesPage;
