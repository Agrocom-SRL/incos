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

import { App, Alert, Button, Col, Empty, Flex, Popover, Row, Spin, Table, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  NodeCollapseOutlined,
  NodeExpandOutlined,
} from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, BackButton } from '@atoms';
import { useBecasReportePage } from '@application-finanzas/hooks/state/useBecasReportePage';
import { useExportBecasReporteExcel } from '@application-finanzas/hooks/api/useExportBecasReporteExcel';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import { becaPorcentajeKey } from '@application-finanzas/mappers/becasReporteMapper';
import {
  formatPorcentaje,
  resolveTramos,
} from '@finanzas/reportes/config/becasTableColumns';
import BecasResumenCards from '@finanzas/reportes/components/organisms/BecasResumenCards';
import BecasDistribucionTipo from '@finanzas/reportes/components/organisms/BecasDistribucionTipo';
import BecasCoberturaNivel from '@finanzas/reportes/components/organisms/BecasCoberturaNivel';
import BecasCatalogoCobertura from '@finanzas/reportes/components/organisms/BecasCatalogoCobertura';
import {
  buildCarreraTint,
  tintAlphaByNivel,
  ALPHA_BORDE,
} from '@finanzas/reportes/config/becasRowTint';
import { resolveCarreraDashboardColor } from '@application-institucional/horarios/utils/carreraDashboardColor';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/reportes/styles/finanzas-planilla.css';
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
 * Alineada con la nueva grilla del ÁRBOL: Detalle (colSpan 1), Matriculados,
 * [tramos canónicos+extra], Total con beca, % con beca, % cobertura (vacío: el
 * agregado de cobertura no es una simple suma y vive en el resumen general).
 */
const renderTotalesRow = (totales, porcentajes) => {
  if (!totales) return null;
  const tramos = resolveTramos(porcentajes);
  let cellIndex = 0;
  return (
    <Table.Summary fixed>
      <Table.Summary.Row className="fin-planilla__row-total">
        <Table.Summary.Cell index={cellIndex++} align="left">
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
      </Table.Summary.Row>
    </Table.Summary>
  );
};

const BecasReportePage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    gestionId,
    porcentajes,
    tableColumns,
    filas,
    expandableRowKeys,
    totales,
    distribucionTramosPorScope,
    coberturaPorNivelAgrupado,
    destacados,
    resumen,
    catalogo,
    catalogoResumen,
  } = useBecasReportePage();

  // Árbol EXPANDIDO por defecto (se ve todo el detalle al inicio). El toggle de
  // cabecera permite colapsar/expandir todos los nodos con hijos de una vez.
  const [expandedRowKeys, setExpandedRowKeys] = useState(expandableRowKeys);

  // Si cambian los datos (otra gestión / refetch), reabre todo el árbol. Patrón
  // de "ajuste de estado en render" (sin efecto) recomendado por React.
  const [prevFilas, setPrevFilas] = useState(filas);
  if (filas !== prevFilas) {
    setPrevFilas(filas);
    setExpandedRowKeys(expandableRowKeys);
  }

  const todoExpandido =
    expandableRowKeys.length > 0 && expandedRowKeys.length === expandableRowKeys.length;

  const handleToggleExpandirTodo = useCallback(() => {
    setExpandedRowKeys((prev) =>
      prev.length === expandableRowKeys.length ? [] : expandableRowKeys,
    );
  }, [expandableRowKeys]);

  // Tinte por carrera (Bloque por carrera): cada fila se tiñe con el color
  // institucional de SU carrera, atenuado por nivel (carrera más visible que sus
  // hijas). Se inyecta como CSS var por fila (`--becas-row-tint`) para que el CSS
  // pinte el fondo de las celdas sin romper el caret/indent del árbol ni la fila
  // de TOTALES (que es un summary, no pasa por `onRow`).
  const handleRowTint = useCallback((record) => {
    const hex = resolveCarreraDashboardColor({
      carreraId: record.carreraId,
      carreraNombre: record.carreraNombre,
    });
    if (!hex) return {};
    const tint = buildCarreraTint(hex, tintAlphaByNivel(record.nivel));
    const edge = buildCarreraTint(hex, ALPHA_BORDE);
    return {
      className: `becas-row becas-row--${record.nivel || 'paralelo'}`,
      style: { '--becas-row-tint': tint, '--becas-row-edge': edge },
    };
  }, []);

  const { exportar, loading: exportando } = useExportBecasReporteExcel();

  const handleExportar = useCallback(async () => {
    const result = await exportar(gestionId);
    if (result.success) {
      notification.success({
        title: 'Reporte exportado',
        description: 'La planilla de becas por carrera se descargó correctamente.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintentá en unos segundos.',
      });
    }
  }, [exportar, gestionId, notification]);

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

          {/* RESUMEN (KPIs + destacados) como titular, a todo el ancho. */}
          <BecasResumenCards resumen={resumen} destacados={destacados} />

          {/* Tres cards hermanas: distribución por tipo · cobertura por nivel ·
              catálogo de descuentos. */}
          <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]} align="stretch">
            <Col xs={24} lg={12} xl={8}>
              <BecasDistribucionTipo
                distribucionTramosPorScope={distribucionTramosPorScope}
                totalConBeca={resumen?.totalConBeca || 0}
                porcentajeConBeca={resumen?.porcentajeConBeca || 0}
              />
            </Col>
            <Col xs={24} lg={12} xl={8}>
              <BecasCoberturaNivel coberturaPorNivelAgrupado={coberturaPorNivelAgrupado} />
            </Col>
            <Col xs={24} xl={8}>
              <BecasCatalogoCobertura catalogo={catalogo} resumen={catalogoResumen} />
            </Col>
          </Row>
        </div>

        {/* DETALLE JERÁRQUICO (planilla) ABAJO: árbol expandible carrera → periodo
            → paralelo, cabecera verde + bloque agrupado + fila de TOTALES. El
            toggle expande/colapsa todos los nodos con hijos de una vez. */}
        <div className="fin-separador becas-detalle__head">
          <span className="fin-separador__titulo">Detalle por carrera, periodo y paralelo</span>
          <Button
            type="text"
            size="small"
            className="becas-detalle__toggle"
            icon={todoExpandido ? <NodeCollapseOutlined /> : <NodeExpandOutlined />}
            onClick={handleToggleExpandirTodo}
            disabled={expandableRowKeys.length === 0}
          >
            {todoExpandido ? 'Colapsar todo' : 'Expandir todo'}
          </Button>
        </div>

        <div className="fin-planilla-wrap">
          <Table
            className="fin-planilla becas-planilla"
            size="small"
            bordered
            rowKey={(record) => record.id}
            dataSource={filas}
            columns={tableColumns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            onRow={handleRowTint}
            expandable={{
              expandedRowKeys,
              onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
              indentSize: Number(allSpacing.marginLG),
            }}
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
            <Flex gap={allSpacing.marginXS} wrap="wrap">
              <ActionButton
                permiso={FINANZAS_PERMISOS.becaReporte}
                accion="EXPORTAR"
                variant="info"
                icon={<FileExcelOutlined />}
                loading={exportando}
                disabled={loading || isEmpty}
                onClick={handleExportar}
              >
                Exportar Excel
              </ActionButton>
              <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                Volver
              </BackButton>
            </Flex>
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
