import { Alert, Empty, Flex, Spin } from 'antd';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { DashboardPageShell } from '@dashboard/components/organisms';
import { PageHeader } from '@molecules';
import { useGestionActualState } from '@application-institucional/actual';
import {
  GestionActualCard,
  GestionActualKpiStrip,
  BimestresTimeline,
  CronogramaGestion,
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
        <Flex vertical gap="large" style={{ width: '100%' }}>
          {/* KPIs a todo el ancho: evita que queden comprimidos junto al panel lateral */}
          <GestionActualKpiStrip kpis={s.kpis} iniciada={s.iniciada} />

          <DashboardPageShell>
            <MainContent>
              <CronogramaGestion
                periodos={s.cronograma}
                proximas={s.proximasActividades}
                onGestionar={s.goToCronograma}
              />
            </MainContent>
            <InfoSidebar>
              <GestionActualCard
                gestionVigente={s.gestionVigente}
                estadoLabel={s.estadoLabel}
                estadoColor={s.estadoColor}
                bimestreVigente={s.kpis?.bimestreVigente}
                onIrAControl={s.goToControl}
              />
              <BimestresTimeline timeline={s.timeline} />
            </InfoSidebar>
          </DashboardPageShell>
        </Flex>
      )}
    </Flex>
  );
};

export default GestionActualPage;
