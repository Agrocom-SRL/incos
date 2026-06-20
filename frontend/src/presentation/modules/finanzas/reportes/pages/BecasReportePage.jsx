/**
 * Planilla de control de becas por carrera (Finanzas · reporte read-only).
 *
 * Página "dumb": compone template + organismos y consume `useBecasReportePage`.
 * No hace fetch ni orquesta (eso vive en el provider + hook de estado).
 *
 * Réplica visual de la PLANILLA oficial del instituto (cabecera AZUL → VERDE
 * primario), usando el KIT de planilla de Finanzas (`finanzas-planilla.css`):
 *   - separador + tabla densa con cabecera verde y bloque agrupado de tramos,
 *   - fila de TOTALES GENERALES (Table.Summary),
 *   - RESUMEN GENERAL POR TIPO DE BECA + DISTRIBUCIÓN (donut) + RESUMEN (KPIs)
 *     + OBSERVACIONES GENERALES.
 */

import { Alert, Button, Col, Empty, Flex, Popover, Row, Spin, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { BackButton } from '@atoms';
import { useBecasReportePage } from '@application-finanzas/hooks/state/useBecasReportePage';
import { becaPorcentajeKey } from '@application-finanzas/mappers/becasReporteMapper';
import {
  formatPorcentaje,
  resolveTramos,
} from '@finanzas/reportes/config/becasTableColumns';
import BecasResumenCards from '@finanzas/reportes/components/organisms/BecasResumenCards';
import BecasDistribucion from '@finanzas/reportes/components/organisms/BecasDistribucion';
import BecasCatalogoCobertura from '@finanzas/reportes/components/organisms/BecasCatalogoCobertura';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/styles/finanzas-planilla.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';
import '@finanzas/reportes/styles/becas-reporte.css';

const { Paragraph, Text } = Typography;

/** Contenido informativo (observaciones generales) que vive dentro del Popover. */
const observacionesContent = (
  <ul className="becas-observaciones__lista">
    <li>
      El % de cobertura por carrera corresponde a la proporción de estudiantes
      matriculados que cuentan con beca.
    </li>
    <li>
      Los tramos (25 %, 50 %, 75 %, 100 %) se determinan por el porcentaje de
      descuento asignado a cada estudiante.
    </li>
    <li>Reporte de solo lectura para la gestión vigente.</li>
  </ul>
);

/** Etiqueta de gestión vigente del reporte (Tag informativo, read-only). */
const renderGestionTag = (gestion) => {
  if (!gestion) return null;
  const label = gestion.nombre || (gestion.anio != null ? String(gestion.anio) : null);
  if (!label) return null;
  return <Tag color="processing">Gestión {label}</Tag>;
};

/**
 * Fila de TOTALES GENERALES de la planilla (Table.Summary).
 * Alineada con la estructura de columnas: Nº+Carrera+Modalidad (colSpan 3),
 * Matriculados, [tramos canónicos+extra], Total con beca, % con beca,
 * % cobertura (vacío), Observaciones (vacío).
 */
const renderTotalesRow = (totales, porcentajes) => {
  if (!totales) return null;
  const tramos = resolveTramos(porcentajes);
  let cellIndex = 0;
  return (
    <Table.Summary fixed>
      <Table.Summary.Row className="fin-planilla__row-total">
        <Table.Summary.Cell index={cellIndex++} colSpan={3} align="right">
          <Text strong>TOTALES GENERALES</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={cellIndex++} align="center" className="fin-num fin-num--center">
          <span className="fin-num--strong">{totales.totalMatriculados || 0}</span>
        </Table.Summary.Cell>
        {tramos.map((porcentaje) => {
          const key = becaPorcentajeKey(porcentaje);
          return (
            <Table.Summary.Cell
              key={key}
              index={cellIndex++}
              align="center"
              className="fin-num fin-num--center"
            >
              <span className="fin-num--strong">{totales.becasPorPorcentaje?.[key] || 0}</span>
            </Table.Summary.Cell>
          );
        })}
        <Table.Summary.Cell index={cellIndex++} align="center" className="fin-num fin-num--center">
          <span className="fin-num--strong">{totales.totalConBeca || 0}</span>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={cellIndex++} align="center" className="fin-num fin-num--center">
          <span className="fin-num--strong">{formatPorcentaje(totales.porcentajeConBeca)}</span>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={cellIndex++} align="center" />
        <Table.Summary.Cell index={cellIndex++} align="left" />
      </Table.Summary.Row>
    </Table.Summary>
  );
};

const BecasReportePage = () => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    porcentajes,
    tableColumns,
    filas,
    totales,
    distribucion,
    resumen,
    catalogo,
    catalogoResumen,
  } = useBecasReportePage();

  let body;
  if (loading) {
    body = (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={allSpacing.marginSM}
        style={{ minHeight: allSpacing.skeletonCardHeight }}
      >
        <Spin size="large" />
        <Text type="secondary">Cargando reporte de becas...</Text>
      </Flex>
    );
  } else if (error) {
    body = <Alert type="error" showIcon title="No se pudo cargar el reporte" description={error} />;
  } else if (isEmpty) {
    body = <Empty description="No hay carreras con matriculados en la gestión" />;
  } else {
    body = (
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {/* RESUMEN GENERAL AL INICIO: distribución (donut) · KPIs · cobertura del
            catálogo, sobre una zona teñida (cuaderno verde tenue) para que las
            tarjetas blancas con sombra resalten. Las observaciones generales
            pasan a un Popover informativo (botón a la derecha del separador). */}
        <div className="becas-resumen-zone">
          <div className="fin-separador becas-resumen-zone__head">
            <span className="fin-separador__titulo">Resumen general por tipo de beca</span>
            <Popover
              rootClassName="becas-obs-popover"
              content={<div className="becas-observaciones__popover">{observacionesContent}</div>}
              title="Observaciones generales"
              trigger="click"
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                className="becas-obs-trigger"
                icon={<InfoCircleOutlined />}
              >
                Observaciones
              </Button>
            </Popover>
          </div>

          <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]} align="stretch">
            <Col xs={24} lg={12} xl={8}>
              <BecasDistribucion
                distribucion={distribucion}
                totalConBeca={resumen?.totalConBeca || 0}
                porcentajeConBeca={resumen?.porcentajeConBeca || 0}
              />
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <BecasResumenCards resumen={resumen} />
            </Col>
            <Col xs={24} xl={8}>
              <BecasCatalogoCobertura catalogo={catalogo} resumen={catalogoResumen} />
            </Col>
          </Row>
        </div>

        {/* DETALLE POR CARRERA (planilla) ABAJO: cabecera verde + bloque agrupado
            + fila de TOTALES GENERALES. */}
        <div className="fin-separador">
          <span className="fin-separador__titulo">Detalle por carrera</span>
        </div>

        <div className="fin-planilla-wrap">
          <Table
            className="fin-planilla becas-planilla"
            size="small"
            bordered
            rowKey={(record) => record.carreraId}
            dataSource={filas}
            columns={tableColumns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            summary={() => renderTotalesRow(totales, porcentajes)}
          />
        </div>
      </Flex>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Becas por carrera"
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
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
              title="Planilla de control de becas por carrera"
              actions={renderGestionTag(gestion)}
            />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Distribución de becas por carrera y tramo: matriculados, becas por porcentaje, total
              con beca y cobertura. Reporte de solo lectura.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">{body}</div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default BecasReportePage;
