/**
 * Config. de pagos (Finanzas) — métodos, bancos, cuentas y becas/descuentos,
 * en un sistema de TABS.
 *
 * Página "dumb" (espejo de `AcademicoPage`): compone `PageHeaderArea` +
 * `DashboardPageShell` + `MainContent` + el workspace `cfg-academico-workspace`
 * con `Tabs` (`?tab=metodos|bancos|cuentas|becas-descuentos`). Cada tab = una
 * entidad con título + descripción breve y su propio panel. Toda la
 * orquestación de métodos/bancos/cuentas (fetch, PUT métodos, POST/PUT bancos
 * y cuentas con QR) vive en `useConfigPagosPage` + `ConfigPagosProvider`; aquí
 * no se hace fetch. El tab "Becas y descuentos" es AUTO-CONTENIDO
 * (`BecasDescuentosTabPanel` monta su propio `BecaDescuentoProvider`, catálogo
 * independiente — permiso `finanzas.beca-descuento`). Ver/editar/activar de
 * bancos/cuentas/métodos vive en su ficha de detalle propia
 * (`/finanzas/configuracion/{bancos,cuentas,metodos}/:id`), ya no en la tabla.
 *
 * El aporte de la gestión vigente vive como página HIJA sin ítem de menú
 * propio, `/finanzas/configuracion/aportes` (permiso `finanzas.aporte`, ver
 * `finanzas/configuracion/pages/AporteConfigPage.jsx`), a la que se llega
 * desde el botón "Configuración de aportes" en `PageHeader`.
 *
 * RBAC: la ruta FIN-CFG es `finanzas.configuracion.pago` LISTAR. El alta
 * (bancos/cuentas) usa CREAR (PermisoGuard en la cabecera del workspace);
 * ver/editar/activar/eliminar viven en la ficha (`finanzas.configuracion.pago`
 * DETALLE/EDITAR/ELIMINAR). Becas y descuentos usa su propio permiso
 * `finanzas.beca-descuento` (LISTAR/CREAR/EDITAR/DETALLE/ELIMINAR).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Empty, Flex, Spin, Tabs, Typography } from 'antd';
import { GoldOutlined, PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { Button, ActionButton } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { allSpacing } from '@theme/tokens';
import { useConfigPagosPage } from '@application-finanzas/hooks/state/useConfigPagosPage';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { BECA_DESCUENTO_PERMISO } from '@finanzas/configuracion/config/becaDescuentoPermisos';
import { becaDescuentoNuevaPath } from '@application-finanzas/config/paths';
import {
  CONFIG_PAGOS_TAB_KEYS,
  CONFIG_PAGOS_TAB_META,
  TAB_BANCOS,
  TAB_BECAS_DESCUENTOS,
  TAB_CUENTAS,
  TAB_METODOS,
} from '@finanzas/configuracion/config/configPagosTabs';
import MetodosTabPanel from '@finanzas/configuracion/components/MetodosTabPanel.jsx';
import BancosTabPanel from '@finanzas/configuracion/components/BancosTabPanel.jsx';
import CuentasTabPanel from '@finanzas/configuracion/components/CuentasTabPanel.jsx';
import BecasDescuentosTabPanel from '@finanzas/configuracion/components/BecasDescuentosTabPanel.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/configuracion/styles/config-pagos.css';

const { Paragraph, Text } = Typography;

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
  const {
    breadcrumbItems,
    metodos,
    bancos,
    cuentas,
    loading,
    error,
    refetch,
    saving,
    // Métodos
    metodoEnEdicion,
    metodoModalAbierto,
    abrirMetodoModal,
    cerrarMetodoModal,
    guardarMetodo,
    // Bancos
    bancoEnEdicion,
    bancoModalAbierto,
    abrirBancoModal,
    cerrarBancoModal,
    guardarBancoSubmit,
    // Cuentas
    cuentaEnEdicion,
    cuentaModalAbierto,
    abrirCuentaModal,
    cerrarCuentaModal,
    guardarCuentaSubmit,
  } = useConfigPagosPage();

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
          <MetodosTabPanel
            metodos={metodos}
            saving={saving}
            drawerAbierto={metodoModalAbierto}
            metodoEnEdicion={metodoEnEdicion}
            onAbrirDrawer={abrirMetodoModal}
            onCerrarDrawer={cerrarMetodoModal}
            onGuardar={guardarMetodo}
          />,
        ),
      },
      {
        key: TAB_BANCOS,
        label: renderTabLabel(CONFIG_PAGOS_TAB_META[TAB_BANCOS]),
        children: wrapTabPanel(
          <BancosTabPanel
            bancos={bancos}
            metodos={metodos}
            saving={saving}
            metodoNombrePorId={metodoNombrePorId}
            drawerAbierto={bancoModalAbierto}
            bancoEnEdicion={bancoEnEdicion}
            onAbrirDrawer={abrirBancoModal}
            onCerrarDrawer={cerrarBancoModal}
            onGuardar={guardarBancoSubmit}
          />,
        ),
      },
      {
        key: TAB_CUENTAS,
        label: renderTabLabel(CONFIG_PAGOS_TAB_META[TAB_CUENTAS]),
        children: wrapTabPanel(
          <CuentasTabPanel
            cuentas={cuentas}
            metodos={metodos}
            bancos={bancos}
            saving={saving}
            metodoNombrePorId={metodoNombrePorId}
            drawerAbierto={cuentaModalAbierto}
            cuentaEnEdicion={cuentaEnEdicion}
            onAbrirDrawer={abrirCuentaModal}
            onCerrarDrawer={cerrarCuentaModal}
            onGuardar={guardarCuentaSubmit}
          />,
        ),
      },
      {
        key: TAB_BECAS_DESCUENTOS,
        label: renderTabLabel(CONFIG_PAGOS_TAB_META[TAB_BECAS_DESCUENTOS]),
        children: wrapTabPanel(<BecasDescuentosTabPanel />),
      },
    ],
    [
      saving,
      metodos,
      metodoModalAbierto,
      metodoEnEdicion,
      abrirMetodoModal,
      cerrarMetodoModal,
      guardarMetodo,
      bancos,
      metodoNombrePorId,
      bancoModalAbierto,
      bancoEnEdicion,
      abrirBancoModal,
      cerrarBancoModal,
      guardarBancoSubmit,
      cuentas,
      cuentaModalAbierto,
      cuentaEnEdicion,
      abrirCuentaModal,
      cerrarCuentaModal,
      guardarCuentaSubmit,
    ],
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

  /** Acción de alta (solo bancos/cuentas), envuelta en PermisoGuard CREAR. */
  const panelActions = useMemo(() => {
    if (activeKey === TAB_BANCOS) {
      return (
        <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="CREAR">
          <Button variant="primary" icon={<PlusOutlined />} onClick={() => abrirBancoModal(null)}>
            Agregar banco
          </Button>
        </PermisoGuard>
      );
    }
    if (activeKey === TAB_CUENTAS) {
      return (
        <PermisoGuard codigo={CONFIG_PAGOS_PERMISO} accion="CREAR">
          <Button variant="primary" icon={<PlusOutlined />} onClick={() => abrirCuentaModal(null)}>
            Agregar cuenta
          </Button>
        </PermisoGuard>
      );
    }
    if (activeKey === TAB_BECAS_DESCUENTOS) {
      return (
        <ActionButton
          permiso={BECA_DESCUENTO_PERMISO}
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(becaDescuentoNuevaPath)}
        >
          Nueva beca o descuento
        </ActionButton>
      );
    }
    return null;
  }, [activeKey, abrirBancoModal, abrirCuentaModal, navigate]);

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
        <Text type="secondary">Cargando configuración de pagos...</Text>
      </Flex>
    );
  } else if (error) {
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
  } else if (metodos.length === 0 && bancos.length === 0 && cuentas.length === 0) {
    body = <Empty description="No hay datos de configuración de pagos" />;
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
