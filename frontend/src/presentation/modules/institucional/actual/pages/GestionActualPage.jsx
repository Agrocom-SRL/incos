import { Alert, Empty, Flex, Spin } from 'antd';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { DashboardPageShell } from '@dashboard/components/organisms';
import { PageHeader } from '@molecules';
import { useGestionActualState } from '@application-institucional/actual';
import {
  GestionActualCard,
  GestionActualKpiStrip,
  BimestresTimeline,
} from '@institucional/actual/components/organisms';

const GestionActualPage = () => {
  const s = useGestionActualState();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title={s.pageTitle} breadcrumbItems={s.breadcrumbItems} />
      </PageHeaderArea>

      {s.loading ? (
        <Flex vertical align="center" justify="center" gap="middle" style={{ padding: 48 }}>
          <Spin size="large" />
          <p>Cargando gestión vigente…</p>
        </Flex>
      ) : s.error ? (
        <Alert title="Error al cargar la gestión actual" description={s.error} type="error" showIcon />
      ) : !s.gestionVigente ? (
        <Empty description="No hay una gestión vigente configurada" />
      ) : (
        <DashboardPageShell>
          <MainContent>
            <Flex vertical gap="large" style={{ width: '100%' }}>
              <GestionActualKpiStrip kpis={s.kpis} />
              <BimestresTimeline timeline={s.timeline} />
            </Flex>
          </MainContent>
          <InfoSidebar>
            <GestionActualCard
              gestionVigente={s.gestionVigente}
              estadoLabel={s.estadoLabel}
              estadoColor={s.estadoColor}
              onIrAControl={s.goToControl}
            />
          </InfoSidebar>
        </DashboardPageShell>
      )}
    </Flex>
  );
};

export default GestionActualPage;
