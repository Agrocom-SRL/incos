/**
 * Config. de pagos (Finanzas) — métodos, bancos y cuentas, en un sistema de
 * TABS.
 *
 * Página "dumb" (espejo de `ComplementariosPage` / `AcademicoPage`): compone
 * `PageHeaderArea` + `DashboardPageShell` + workspace con tabs siempre visibles.
 * El loading vive en cada `TableListView` del tab (no spinner de página completa),
 * igual que Complementarios — el toggle de estado recarga en background sin
 * desmontar tabs. Alta/edición/ver/activar de bancos/cuentas/métodos son
 * páginas completas de navegación (`/finanzas/configuracion/{bancos,cuentas,
 * metodos}/...`, ver `BancoFormPage`/`CuentaFormPage`/`MetodoFormPage`), ya
 * no drawers/modales.
 *
 * "Becas y descuentos" (catálogo maestro) ya NO vive aquí — es su propio
 * ítem de menú "Configuración de becas" (`finanzas/becas/`, permiso
 * `finanzas.beca-descuento`), separado del concepto de parámetros de pago.
 *
 * El aporte de la gestión vigente vive como página HIJA sin ítem de menú
 * propio, `/finanzas/configuracion/aportes` (permiso `finanzas.aporte`, ver
 * `finanzas/configuracion/pages/AporteConfigPage.jsx`), a la que se llega
 * desde el botón "Configuración de aportes" en `PageHeader`.
 *
 * RBAC: la ruta FIN-CFG es `finanzas.configuracion.pago` LISTAR. El alta
 * (bancos/cuentas) usa CREAR (`ActionButton` en la cabecera del workspace);
 * ver/editar/activar/eliminar viven en la ficha/página de edición
 * (`finanzas.configuracion.pago` DETALLE/EDITAR/ELIMINAR).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Flex, Tabs, Typography } from 'antd';
import { GoldOutlined, PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Button, ActionButton } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useConfigPagosPage } from '@application-finanzas/hooks/state/useConfigPagosPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { bancoNuevoPath, cuentaNuevoPath } from '@application-finanzas/config/paths';
import {
  CONFIG_PAGOS_TAB_KEYS,
  CONFIG_PAGOS_TAB_META,
  TAB_BANCOS,
  TAB_CUENTAS,
  TAB_METODOS,
} from '@finanzas/configuracion/config/configPagosTabs';
import MetodosTabPanel from '@finanzas/configuracion/components/MetodosTabPanel.jsx';
import BancosTabPanel from '@finanzas/configuracion/components/BancosTabPanel.jsx';
import CuentasTabPanel from '@finanzas/configuracion/components/CuentasTabPanel.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/configuracion/styles/config-pagos.css';

const { Paragraph } = Typography;

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const renderTabLabel = (meta) => {
  const Icon = meta.icon;
  return (
    <span className="sd-tab-label">
      <Icon /> {meta.shortLabel}
    </span>
  );
};

const ConfigPagosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { breadcrumbItems, metodos, bancos, cuentas, loading, error, refetch, saving } =
    useConfigPagosPage();

  /** Resuelve el nombre del método por id (para las tablas de bancos/cuentas). */
  const metodoNombrePorId = useMemo(() => {
    const mapa = new Map(metodos.map((metodo) => [metodo.id, metodo.nombre]));
    return (id) => (id != null ? (mapa.get(id) ?? null) : null);
  }, [metodos]);

  const tabItems = useMemo(
    () => [
      {
        key: TAB_METODOS,
        label: renderTabLabel(CONFIG_PAGOS_TAB_META[TAB_METODOS]),
        children: wrapTabPanel(
          <MetodosTabPanel metodos={metodos} loading={loading} error={error} saving={saving} />,
        ),
      },
      {
        key: TAB_BANCOS,
        label: renderTabLabel(CONFIG_PAGOS_TAB_META[TAB_BANCOS]),
        children: wrapTabPanel(
          <BancosTabPanel
            bancos={bancos}
            loading={loading}
            error={error}
            saving={saving}
            metodoNombrePorId={metodoNombrePorId}
          />,
        ),
      },
      {
        key: TAB_CUENTAS,
        label: renderTabLabel(CONFIG_PAGOS_TAB_META[TAB_CUENTAS]),
        children: wrapTabPanel(
          <CuentasTabPanel
            cuentas={cuentas}
            loading={loading}
            error={error}
            saving={saving}
            metodoNombrePorId={metodoNombrePorId}
          />,
        ),
      },
    ],
    [loading, error, saving, metodos, bancos, metodoNombrePorId, cuentas],
  );

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab');
    if (requested && CONFIG_PAGOS_TAB_KEYS.includes(requested)) {
      return requested;
    }
    return TAB_METODOS;
  }, [searchParams]);

  const activePanel = CONFIG_PAGOS_TAB_META[activeKey];

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  /** Acción de alta (solo bancos/cuentas), navega a la página completa de alta. */
  const panelActions = useMemo(() => {
    if (activeKey === TAB_BANCOS) {
      return (
        <ActionButton
          permiso={CONFIG_PAGOS_PERMISO}
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(bancoNuevoPath)}
        >
          Agregar banco
        </ActionButton>
      );
    }
    if (activeKey === TAB_CUENTAS) {
      return (
        <ActionButton
          permiso={CONFIG_PAGOS_PERMISO}
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(cuentaNuevoPath)}
        >
          Agregar cuenta
        </ActionButton>
      );
    }
    return null;
  }, [activeKey, navigate]);

  /**
   * Acción de página (no por-tab): ir a la configuración del aporte de la
   * gestión vigente. Propaga la pestaña activa como `returnTab` para que el
   * botón "volver" de esa página regrese al mismo tab, no siempre a métodos.
   */
  const pageHeaderActions = (
    <PermisoGuard codigo="finanzas.aporte" accion="LISTAR">
      <Button
        variant="primary"
        icon={<GoldOutlined />}
        onClick={() =>
          navigate('/finanzas/configuracion/aportes', { state: { returnTab: activeKey } })
        }
      >
        Configuración de aportes
      </Button>
    </PermisoGuard>
  );

  let body;
  if (error) {
    body = (
      <Alert
        type="error"
        showIcon
        title="No se pudo cargar la configuración de pagos"
        description={typeof error === 'string' ? error : String(error)}
        action={
          <Button variant="info" size="small" onClick={refetch}>
            Reintentar
          </Button>
        }
      />
    );
  } else {
    body = (
      <section className="cfg-academico-workspace">
        <header className="cfg-academico-workspace__header">
          <ListPanelHeader title={activePanel?.title ?? 'Config. de pagos'} actions={panelActions} />
          {activePanel?.description ? (
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              {activePanel.description}
            </Paragraph>
          ) : null}
        </header>

        <div className="sd-tabs-shell cfg-academico-tabs-shell">
          <Tabs
            className="sd-tabs cfg-academico-workspace__tabs"
            activeKey={activeKey}
            items={tabItems}
            onChange={onTabChange}
            destroyOnHidden={false}
          />
        </div>
      </section>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Config. de pagos"
          breadcrumbItems={breadcrumbItems}
          actions={pageHeaderActions}
        />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>{body}</MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ConfigPagosPage;
