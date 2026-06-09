import { Alert, Empty, Flex, Spin } from 'antd';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { useGestionActualState } from '@application-institucional/actual';
import { GestionActualCard } from '@institucional/actual/components/organisms';

const GestionActualPage = () => {
  const s = useGestionActualState();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title={s.pageTitle} breadcrumbItems={s.breadcrumbItems} />
      </PageHeaderArea>

      <MainContent>
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
          <GestionActualCard
            gestionVigente={s.gestionVigente}
            iniciada={s.iniciada}
            estadoLabel={s.estadoLabel}
            estadoColor={s.estadoColor}
            matriculasCursando={s.matriculasCursando}
            iniciando={s.iniciando}
            onActivarCursado={s.handleActivarCursado}
          />
        )}
      </MainContent>
    </Flex>
  );
};

export default GestionActualPage;
