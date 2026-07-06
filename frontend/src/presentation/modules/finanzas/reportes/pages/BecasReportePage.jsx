/**
 * Planilla de control de becas por carrera (Finanzas · reporte read-only).
 *
 * Página "dumb": compone template + organismos y consume `useBecasReportePage`.
 * No hace fetch ni orquesta (eso vive en el provider + hook de estado).
 *
 * Estructura (mismo patrón que `CuentasPorCobrarPage`):
 *   RESUMEN GENERAL POR TIPO DE BECA (KPIs + distribución + cobertura +
 *   catálogo) → UNA PESTAÑA POR CARRERA con el detalle (planilla densa
 *   agrupada por paralelo, kit `finanzas-planilla.css`, ver
 *   `BecasCarreraSection`). El detalle NO es un árbol expandible: cada
 *   carrera es una pestaña y, dentro, los estudiantes son filas normales de
 *   una única tabla (sin nivel de periodo/año ni tablas anidadas).
 */

import { App, Alert, Button, Col, Empty, Flex, Popover, Row, Spin, Tabs, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  BankOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton, BackButton } from '@atoms';
import { useBecasReportePage } from '@application-finanzas/hooks/state/useBecasReportePage';
import { useExportBecasReporteExcel } from '@application-finanzas/hooks/api/useExportBecasReporteExcel';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import { createBecasEstudianteColumns } from '@finanzas/reportes/config/becasEstudianteColumns';
import BecasResumenCards from '@finanzas/reportes/components/organisms/BecasResumenCards';
import BecasDistribucionTipo from '@finanzas/reportes/components/organisms/BecasDistribucionTipo';
import BecasCoberturaNivel from '@finanzas/reportes/components/organisms/BecasCoberturaNivel';
import BecasCatalogoCobertura from '@finanzas/reportes/components/organisms/BecasCatalogoCobertura';
import BecasCarreraSection from '@finanzas/reportes/components/organisms/BecasCarreraSection';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/reportes/styles/finanzas-planilla.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';
import '@finanzas/reportes/styles/becas-reporte.css';

const { Paragraph, Text } = Typography;

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

/** Clave estable de pestaña por carrera. */
const carreraKey = (carrera) => String(carrera.carreraId ?? carrera.carreraNombre);

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

const BecasReportePage = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    loading,
    error,
    isEmpty,
    breadcrumbItems,
    gestion,
    gestionId,
    carreras,
    distribucionTramosPorScope,
    coberturaPorNivelAgrupado,
    destacados,
    resumen,
    catalogo,
    catalogoResumen,
  } = useBecasReportePage();

  const estudianteColumns = useMemo(() => createBecasEstudianteColumns(), []);

  const tabItems = useMemo(
    () =>
      carreras.map((carrera) => ({
        key: carreraKey(carrera),
        label: (
          <span className="sd-tab-label">
            <BankOutlined /> {carrera.carreraNombre}
          </span>
        ),
        children: wrapTabPanel(
          <BecasCarreraSection carrera={carrera} columns={estudianteColumns} />,
        ),
      })),
    [carreras, estudianteColumns],
  );

  const activeKey = useMemo(() => {
    const requested = searchParams.get('carrera');
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) return requested;
    return keys[0] ?? null;
  }, [searchParams, tabItems]);

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ carrera: key }, { replace: true });
    },
    [setSearchParams],
  );

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

        {/* DETALLE POR CARRERA (planillas densas) ABAJO, en pestañas. */}
        <div className="fin-separador">
          <span className="fin-separador__titulo">Detalle por carrera</span>
        </div>

        {tabItems.length ? (
          <div className="sd-tabs-shell cfg-academico-tabs-shell">
            <Tabs
              className="sd-tabs cfg-academico-workspace__tabs"
              activeKey={activeKey}
              items={tabItems}
              onChange={onTabChange}
              destroyOnHidden={false}
            />
          </div>
        ) : (
          <Empty description="No hay carreras con matriculados en la gestión" />
        )}
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
