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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Empty, Flex, Spin, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, BankOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Alert, BackButton } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { useCuentasPorCobrarPage } from '@application-finanzas/hooks/state/useCuentasPorCobrarPage';
import { createCuentasPorCobrarColumns, formatBs, formatFecha } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import CuentasPorCobrarCarreraSection from '@finanzas/reportes/components/organisms/CuentasPorCobrarCarreraSection';
import CuentasPorCobrarResumen from '@finanzas/reportes/components/organisms/CuentasPorCobrarResumen';
import CuentasPorCobrarLeyenda from '@finanzas/reportes/components/organisms/CuentasPorCobrarLeyenda';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/styles/finanzas-planilla.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';

const { Paragraph } = Typography;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    loading,
    error,
    isEmpty,
    gestion,
    montoMaximoPorEstudiante,
    fechaEmision,
    carreras,
    resumen,
    leyenda,
    observacionesGenerales,
  } = useCuentasPorCobrarPage();

  const columns = useMemo(() => createCuentasPorCobrarColumns(), []);

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
      <Flex align="center" justify="center" style={{ minHeight: allSpacing.skeletonCardHeight }}>
        <Spin size="large" tip="Cargando cuentas por cobrar..." />
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

        {/* Resumen general (KPIs + bloque destacado de pendiente). */}
        <CuentasPorCobrarResumen resumen={resumen} />

        {/* Detalle por carrera en pestañas (solo deudores). */}
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

        {/* Leyenda de alertas + observaciones generales. */}
        <CuentasPorCobrarLeyenda leyenda={leyenda} observaciones={observacionesGenerales} />
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
            <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Volver
            </BackButton>
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
