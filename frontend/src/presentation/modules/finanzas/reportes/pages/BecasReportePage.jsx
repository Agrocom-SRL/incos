/**
 * Planilla de control de becas por carrera (Finanzas · reporte read-only).
 *
 * Página "dumb": compone template + organismos y consume `useBecasReportePage`.
 * No hace fetch ni orquesta (eso vive en el provider + hook de estado).
 *
 * Estructura (patrón CFG académico / Docentes):
 *   resumen (tarjetas) + distribución (donut sustituto) + planilla (tabla con
 *   columnas dinámicas por porcentaje y fila de TOTALES via Table.Summary).
 */

import { Alert, Col, Empty, Flex, Row, Spin, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { BackButton } from '@atoms';
import { useBecasReportePage } from '@application-finanzas/hooks/state/useBecasReportePage';
import { becaPorcentajeKey } from '@application-finanzas/mappers/becasReporteMapper';
import { formatPorcentaje } from '@finanzas/reportes/config/becasTableColumns';
import BecasResumenCards from '@finanzas/reportes/components/organisms/BecasResumenCards';
import BecasDistribucion from '@finanzas/reportes/components/organisms/BecasDistribucion';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';

const { Paragraph, Text } = Typography;

/** Etiqueta de gestión vigente del reporte (Tag informativo, read-only). */
const renderGestionTag = (gestion) => {
  if (!gestion) return null;
  const label = gestion.nombre || (gestion.anio != null ? String(gestion.anio) : null);
  if (!label) return null;
  return <Tag color="processing">Gestión {label}</Tag>;
};

/** Fila de TOTALES GENERALES de la planilla (Table.Summary). */
const renderTotalesRow = (totales, porcentajes) => {
  if (!totales) return null;
  // Índices: 0=Nº, 1=Carrera, 2=Modalidad, 3=Matriculados, 4..=tramos, luego total/%/cobertura.
  let cellIndex = 0;
  return (
    <Table.Summary fixed>
      <Table.Summary.Row className="becas-reporte__summary">
        <Table.Summary.Cell index={cellIndex++} colSpan={3} align="right">
          <Text strong>TOTALES GENERALES</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={cellIndex++} align="center">
          <Text strong>{totales.totalMatriculados || 0}</Text>
        </Table.Summary.Cell>
        {porcentajes.map((porcentaje) => {
          const key = becaPorcentajeKey(porcentaje);
          return (
            <Table.Summary.Cell key={key} index={cellIndex++} align="center">
              <Text strong>{totales.becasPorPorcentaje?.[key] || 0}</Text>
            </Table.Summary.Cell>
          );
        })}
        <Table.Summary.Cell index={cellIndex++} align="center">
          <Text strong>{totales.totalConBeca || 0}</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={cellIndex++} align="center">
          <Text strong>{formatPorcentaje(totales.porcentajeConBeca)}</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={cellIndex++} align="center" />
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
  } = useBecasReportePage();

  let body;
  if (loading) {
    body = (
      <Flex align="center" justify="center" style={{ minHeight: allSpacing.skeletonCardHeight }}>
        <Spin size="large" tip="Cargando reporte de becas..." />
      </Flex>
    );
  } else if (error) {
    body = <Alert type="error" showIcon title="No se pudo cargar el reporte" description={error} />;
  } else if (isEmpty) {
    body = <Empty description="No hay carreras con matriculados en la gestión" />;
  } else {
    body = (
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <BecasResumenCards resumen={resumen} />

        <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]}>
          <Col xs={24} xl={8}>
            <BecasDistribucion
              distribucion={distribucion}
              totalConBeca={resumen?.totalConBeca || 0}
              porcentajeConBeca={resumen?.porcentajeConBeca || 0}
            />
          </Col>
          <Col xs={24} xl={16}>
            <Table
              size="small"
              bordered
              rowKey={(record) => record.carreraId}
              dataSource={filas}
              columns={tableColumns}
              pagination={false}
              scroll={{ x: 'max-content' }}
              summary={() => renderTotalesRow(totales, porcentajes)}
            />
          </Col>
        </Row>
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
