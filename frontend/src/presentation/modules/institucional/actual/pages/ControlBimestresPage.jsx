import { Flex, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useControlBimestresState } from '@application-institucional/actual';
import { ControlBimestresPanel } from '@institucional/actual/components/organisms';

const ControlBimestresPage = () => {
  const s = useControlBimestresState();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <ActionButton
              permiso="institucional.gestion.actual"
              accion="LISTAR"
              variant="back"
              icon={<ArrowLeftOutlined />}
              onClick={s.goToPanel}
            >
              volver
            </ActionButton>
          }
        />
      </PageHeaderArea>

      <MainContent>
        {s.loading ? (
          <Flex vertical align="center" justify="center" gap="middle" style={{ padding: 48 }}>
            <Spin size="large" />
            <p>Cargando estado de la gestión…</p>
          </Flex>
        ) : (
          <ControlBimestresPanel
            iniciada={s.iniciada}
            estadoLabel={s.estadoLabel}
            estadoColor={s.estadoColor}
            bimestreVigente={s.bimestreVigente}
            fase={s.fase}
            iniciando={s.iniciando}
            cerrando={s.cerrando}
            validacion={s.validacion}
            onIniciarGestion={s.handleIniciarGestion}
            onValidarCierre={s.handleValidarCierre}
            onCerrarBimestre={s.handleCerrarBimestre}
          />
        )}
      </MainContent>
    </Flex>
  );
};

export default ControlBimestresPage;
