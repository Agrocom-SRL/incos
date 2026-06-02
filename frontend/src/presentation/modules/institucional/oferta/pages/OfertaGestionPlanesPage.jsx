import { Alert, Button, Flex, Modal, Select, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useOfertaGestionPlanesState } from '@application-institucional/oferta';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';
import { OfertaAlertBanner, OfertaKpiStrip, OfertaStepPlanesSection } from '../components';

const OfertaGestionPlanesPage = () => {
  const s = useOfertaGestionPlanesState();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica', href: '/institucional/oferta' },
    { title: 'Gestiones pasadas', href: '/institucional/pasadas' },
    { title: s.gestionSeleccionada?.codigo ?? 'Gestión' },
    { title: 'Planes' },
  ];

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM}>
              <Button icon={<ArrowLeftOutlined />} onClick={s.navigateBack}>
                Volver
              </Button>
              <ActionButton
                permiso="institucional.oferta.gestion-plan"
                accion="CREAR"
                onClick={s.openHabilitarPlanModal}
              >
                Habilitar plan
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <MainContent>
        <Spin spinning={s.apiLoading}>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%' }}>
            {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

            <OfertaAlertBanner
              step={1}
              kpis={s.kpis}
              gestionVigente={s.gestionSeleccionada?.vigente}
            />

            <OfertaKpiStrip kpis={s.kpis} variant="details" />

            <OfertaStepPlanesSection
              loading={s.apiLoading}
              planesHabilitados={s.planesHabilitados}
              onSelectPlan={s.onVerParalelos}
            />
          </Flex>
        </Spin>
      </MainContent>

      <Modal
        title="Habilitar plan de estudio"
        open={s.modalHabilitarPlan}
        onCancel={() => s.setModalHabilitarPlan(false)}
        footer={null}
        destroyOnClose
      >
        <Select
          showSearch
          placeholder="Plan vigente"
          style={{ width: '100%' }}
          optionFilterProp="label"
          options={s.planesVigentes
            .filter((p) => p.vigente !== false)
            .map((p) => ({
              value: p.id,
              label: p.nombre ?? p.codigo ?? `Plan #${p.id}`,
            }))}
          onChange={(planId) => s.onHabilitarPlan(planId)}
        />
      </Modal>
    </Flex>
  );
};

export default OfertaGestionPlanesPage;
