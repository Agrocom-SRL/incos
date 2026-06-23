/**
 * Planilla de control de cuentas por cobrar a estudiantes (Finanzas · reporte
 * read-only). Base visual de AcademicoPage: shell con workspace + Tabs.
 *
 * Página "dumb": compone template + organismos y consume `useCuentasPorCobrarPage`.
 * No hace fetch ni orquesta (eso vive en el provider + hook de estado).
 *
 * Estructura:
 *   cabecera (datos de emisión) → resumen general (KPIs + total pendiente)
 *   → UNA PESTAÑA POR CARRERA (planilla densa por paralelo) → leyenda.
 * Solo se listan estudiantes que DEBEN (saldo > 0); los que están al día se ocultan
 * (es una planilla de cobranza). Las carreras sin deudores no generan pestaña.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { App, Col, Empty, Flex, Row, Spin, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, BankOutlined, FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Alert, ActionButton, BackButton } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { useCuentasPorCobrarPage } from '@application-finanzas/hooks/state/useCuentasPorCobrarPage';
import { useExportCuentasPorCobrarExcel } from '@application-finanzas/hooks/api/useExportCuentasPorCobrarExcel';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import { createCuentasPorCobrarColumns, formatBs, formatFecha } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import CuentasPorCobrarCarreraSection from '@finanzas/reportes/components/organisms/CuentasPorCobrarCarreraSection';
import CuentasPorCobrarResumen from '@finanzas/reportes/components/organisms/CuentasPorCobrarResumen';
import CuentasPorCobrarPendientePorCarrera from '@finanzas/reportes/components/organisms/CuentasPorCobrarPendientePorCarrera';
import CuentasPorCobrarLeyenda from '@finanzas/reportes/components/organisms/CuentasPorCobrarLeyenda';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/styles/finanzas-planilla.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';

const { Paragraph, Text } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Reportes de pagos' },
  { title: 'Cuentas por cobrar' },
];

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

/** Etiqueta de gestión vigente del reporte (Tag informativo, read-only). */
const renderGestionTag = (gestion) => {
  if (!gestion) return null;
  const label = gestion.nombre || (gestion.anio != null ? String(gestion.anio) : null);
  if (!label) return null;
  return <Tag color="processing">Gestión {label}</Tag>;
};

/** Clave estable de pestaña por carrera. */
const carreraKey = (carrera) => String(carrera.carreraId ?? carrera.carreraNombre);

/**
 * Filtra cada carrera a SOLO deudores (saldo > 0): descarta paralelos sin deudores
 * y carreras que queden sin paralelos. Los totales de carrera se conservan tal
 * cual (el pendiente no cambia: los al día aportan 0).
 */
const filtrarDeudores = (carreras) =>
  (carreras || [])
    .map((carrera) => {
      const paralelos = (carrera.paralelos || [])
        .map((paralelo) => ({
          ...paralelo,
          estudiantes: (paralelo.estudiantes || []).filter(
            (estudiante) => Number(estudiante.saldoPendiente) > 0,
          ),
        }))
        .filter((paralelo) => paralelo.estudiantes.length > 0);
      return { ...carrera, paralelos };
    })
    .filter((carrera) => carrera.paralelos.length > 0);

const CuentasPorCobrarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    loading,
    error,
    isEmpty,
    gestion,
    gestionId,
    montoMaximoPorEstudiante,
    fechaEmision,
    carreras,
    resumen,
    leyenda,
    observacionesGenerales,
  } = useCuentasPorCobrarPage();

  const { exportar, loading: exportando } = useExportCuentasPorCobrarExcel();

  const handleExportar = useCallback(async () => {
    const result = await exportar(gestionId);
    if (result.success) {
      notification.success({
        title: 'Reporte exportado',
        description: 'La planilla de cuentas por cobrar se descargó correctamente.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintentá en unos segundos.',
      });
    }
  }, [exportar, gestionId, notification]);

  // Ir a saldar la deuda del estudiante en el formulario de registro de pago.
  // `returnListPath` (ruta actual + tab activa) hace que "Volver" regrese aquí.
  const handleRegistrarPago = useCallback(
    (estudianteId) => {
      if (!estudianteId) return;
      navigate('/pagos/registrar', {
        state: {
          studentId: Number(estudianteId),
          returnListPath: `${location.pathname}${location.search}`,
        },
      });
    },
    [navigate, location.pathname, location.search],
  );

  const columns = useMemo(
    () => createCuentasPorCobrarColumns(handleRegistrarPago),
    [handleRegistrarPago],
  );

  const carrerasDeudoras = useMemo(() => filtrarDeudores(carreras), [carreras]);

  const tabItems = useMemo(
    () =>
      carrerasDeudoras.map((carrera) => ({
        key: carreraKey(carrera),
        label: (
          <span className="sd-tab-label">
            <BankOutlined /> {carrera.carreraNombre}
          </span>
        ),
        children: wrapTabPanel(
          <CuentasPorCobrarCarreraSection carrera={carrera} columns={columns} />,
        ),
      })),
    [carrerasDeudoras, columns],
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
        <Text type="secondary">Cargando cuentas por cobrar...</Text>
      </Flex>
    );
  } else if (error) {
    body = <Alert type="error" showIcon title="No se pudo cargar el reporte" description={error} />;
  } else if (isEmpty) {
    body = <Empty description="No hay carreras con cuentas por cobrar en la gestión" />;
  } else {
    body = (
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {/* Datos de emisión (banda verde). */}
        <div className="fin-separador cobranza-cabecera">
          <span className="fin-separador__titulo">Datos de emisión</span>
          <span className="cobranza-cabecera__meta">
            <span>
              Gestión: <strong>{gestion?.nombre || gestion?.anio || '—'}</strong>
            </span>
            <span>
              Modalidad: <strong>ANUALIZADA</strong>
            </span>
            <span>
              Monto máximo por estudiante: <strong>{formatBs(montoMaximoPorEstudiante)} Bs</strong>
            </span>
            <span>
              Fecha de emisión: <strong>{formatFecha(fechaEmision)}</strong>
            </span>
          </span>
        </div>

        {/* ZONA ESTADÍSTICA AL INICIO (igual que en Becas): resumen general (KPIs
            + bloque destacado de pendiente), gráfico de saldo pendiente por
            carrera (barras horizontales) y leyenda de alertas. Sobre fondo verde
            tenue para que las tarjetas blancas con sombra resalten. */}
        <div className="cobranza-resumen-zone">
          <div className="fin-separador cobranza-resumen-zone__head">
            <span className="fin-separador__titulo">Resumen general</span>
          </div>

          <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]} align="stretch">
            <Col xs={24} xl={14}>
              <CuentasPorCobrarResumen resumen={resumen} />
            </Col>
            <Col xs={24} xl={10}>
              <CuentasPorCobrarPendientePorCarrera
                carreras={carreras}
                totalPendiente={resumen?.totalPendientePorCobrar || 0}
              />
            </Col>
          </Row>

          <CuentasPorCobrarLeyenda leyenda={leyenda} observaciones={observacionesGenerales} />
        </div>

        {/* DETALLE POR CARRERA (planillas densas) ABAJO, en pestañas (solo deudores). */}
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
          <Empty description="No hay cuentas por cobrar pendientes: todos los estudiantes están al día." />
        )}
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Cuentas por cobrar"
          breadcrumbItems={BREADCRUMB}
          actions={
            <Flex gap={allSpacing.marginXS} wrap="wrap">
              <ActionButton
                permiso={FINANZAS_PERMISOS.cuentaCobrarReporte}
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
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader
                title="Planilla de control de cuentas por cobrar"
                actions={renderGestionTag(gestion)}
              />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Cuentas por cobrar a estudiantes por carrera y paralelo: saldo pendiente, fecha de
                compromiso, días de atraso y estado. Solo se listan los estudiantes con saldo
                pendiente; los que están al día no se muestran. Reporte de solo lectura.
              </Paragraph>
            </header>
            <div className="cfg-academico-tab-panel">{body}</div>
          </section>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default CuentasPorCobrarPage;
