import { Col, Flex, Row, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { BackButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useControlBimestresState } from '@application-institucional/actual';
import {
  BimestresCalendarBoard,
  BimestresConfigAside,
} from '@institucional/actual/components/organisms';
import '@configuracion/academico/styles/academico-form-page.css';
import '@institucional/actual/styles/bimestres-calendar.css';

const { Paragraph } = Typography;

const ControlBimestresPage = () => {
  const s = useControlBimestresState();

  return (
    <PageTemplate
      header={
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={s.goToPanel}>
              Volver
            </BackButton>
          }
        />
      }
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader
              title={s.gestion ? `Configuración de bimestres — ${s.gestion.nombre}` : 'Configuración de bimestres'}
              actions={<Tag color={s.estadoColor}>{s.estadoLabel}</Tag>}
            />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Calendario anual de la gestión vigente: cada etapa se pinta con su color. Edita las
              fechas de cada bimestre o etapa desde el panel derecho (el calendario se actualiza en
              vivo) y habilita el inicio de clases si aún no comenzó.
            </Paragraph>
          </header>

          <div className="cfg-academico-tab-panel">
            {s.loading ? (
              <Flex vertical align="center" justify="center" gap="middle" style={{ padding: 48 }}>
                <Spin size="large" />
                <p>Cargando configuración de la gestión…</p>
              </Flex>
            ) : (
              <Flex vertical gap={allSpacing.marginLG}>
                <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]} align="top">
                  <Col xs={24} lg={15}>
                    <BimestresCalendarBoard periodos={s.periodos} anio={s.anioCalendario} />
                  </Col>
                  <Col xs={24} lg={9}>
                    <BimestresConfigAside
                      iniciada={s.iniciada}
                      fase={s.fase}
                      iniciando={s.iniciando}
                      onIniciarGestion={s.handleIniciarGestion}
                      periodos={s.periodos}
                      dirtyCount={s.dirtyCount}
                      guardando={s.guardando}
                      creando={s.creando}
                      setRangoPeriodo={s.setRangoPeriodo}
                      guardarFechas={s.guardarFechas}
                      crearEtapa={s.crearEtapa}
                      eliminarEtapa={s.eliminarEtapa}
                    />
                  </Col>
                </Row>
              </Flex>
            )}
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default ControlBimestresPage;
