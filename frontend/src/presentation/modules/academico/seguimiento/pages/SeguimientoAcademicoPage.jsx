/**
 * Seguimiento académico (ítem ACA-SEGUIMIENTO · /academico/seguimiento?tab=…).
 *
 * Agrupación 2026-08-01: los ítems de sidebar ACA-AVANCE y los 3 de
 * Acompañamiento se funden en UNA página contenedora con pestañas gateadas
 * por permiso (extensión del patrón Avance/Deserción de la disolución REP;
 * CERO cambios de RBAC — cada pestaña usa el permiso de su pantalla original):
 *
 *   - avance    (`academico.avance` LISTAR)                — export Excel en cabecera.
 *   - desercion (`academico.desercion` LISTAR)             — export Excel en cabecera.
 *   - alertas   (`academico.acompanamiento.alerta` LISTAR) — connector role-aware
 *                (DOCENTE → «Mis alumnos en riesgo»); filtros dentro de la pestaña.
 *   - sesiones  (`academico.acompanamiento.sesion` LISTAR) — el ABM navega a las
 *                rutas existentes (/academico/acompanamiento/sesiones/…).
 *   - panel     (`academico.acompanamiento.panel` LISTAR)  — export PDF dentro del panel.
 *
 * Rol ESTUDIANTE: solo tiene `academico.avance` y el backend responde
 * `alcance: 'PROPIO'` → la página degrada a la ficha «Mi avance» (sin tabs;
 * el labelByRole del menú ya renombra el ítem).
 *
 * Las pestañas de acompañamiento embeben sus connectors existentes en modo
 * `embedded` (provider + contenido, sin shell de página): el fetch de cada una
 * ocurre recién al activarla (Tabs monta el children en su primera activación).
 *
 * Shell del prototipo CFG Académico (workspace + tabs); la orquestación de
 * datos vive en los hooks de estado y providers de cada submódulo.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, App, Flex, Tabs, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import { esDocente, useAuthContext } from '@application-auth';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { AVANCE_PERMISOS } from '@application-academico/avance/utils/avancePermisos.js';
import { useAvanceAcademicoPage } from '@application-academico/avance/hooks/state/useAvanceAcademicoPage.js';
import { useDesercionPage } from '@application-academico/avance/hooks/state/useDesercionPage.js';
import { useExportAvanceAcademicoExcel } from '@application-academico/avance/hooks/api/useExportAvanceAcademicoExcel.js';
import { useExportDesercionExcel } from '@application-academico/avance/hooks/api/useExportDesercionExcel.js';
import { ACA_SEGUIMIENTO_MENU_KEY } from '@application-academico/seguimiento/config/paths';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import AvanceTabPanel from '@academico/avance/components/AvanceTabPanel.jsx';
import DesercionTabPanel from '@academico/avance/components/DesercionTabPanel.jsx';
import MiAvancePanel from '@academico/avance/components/MiAvancePanel.jsx';
import AlertasRiesgoListConnector from '@academico/acompanamiento/alertas/connectors/AlertasRiesgoListConnector.jsx';
import SesionesListConnector from '@academico/acompanamiento/sesiones/connectors/SesionesListConnector.jsx';
import PanelAcompanamientoConnector from '@academico/acompanamiento/panel/connectors/PanelAcompanamientoConnector.jsx';
import {
  SEGUIMIENTO_TAB_META,
  SEGUIMIENTO_TAB_ORDER,
  TAB_ALERTAS,
  TAB_AVANCE,
  TAB_DESERCION,
  TAB_PANEL,
  TAB_SESIONES,
  getSeguimientoTabMeta,
} from '../config/seguimientoTabs.js';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const SeguimientoAcademicoPage = ({ defaultTab = TAB_AVANCE }) => {
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso, usuario } = useAuthContext();

  const docente = esDocente(usuario);
  const puedeTab = useCallback(
    (tabKey) => hasPermiso(SEGUIMIENTO_TAB_META[tabKey].permiso, 'LISTAR'),
    [hasPermiso],
  );

  const puedeAvance = puedeTab(TAB_AVANCE);
  const puedeDesercion = puedeTab(TAB_DESERCION);

  // Hooks de Avance/Deserción a nivel de página (sin provider, patrón original);
  // `enabled` evita el fetch cuando el rol no tiene la pestaña (p. ej. SEC_ACADEMICA).
  const avanceState = useAvanceAcademicoPage({ enabled: puedeAvance });
  const desercionState = useDesercionPage({ enabled: puedeDesercion });

  const esPropio = puedeAvance && avanceState.alcance === 'PROPIO';

  const { exportar: exportarAvance, loading: exportandoAvance } = useExportAvanceAcademicoExcel();
  const { exportar: exportarDesercion, loading: exportandoDesercion } = useExportDesercionExcel();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems(ACA_SEGUIMIENTO_MENU_KEY, 'ACA', esPropio ? 'Mi avance' : null),
    [esPropio],
  );

  const handleExportarAvance = useCallback(async () => {
    const result = await exportarAvance({ carreraId: avanceState.carreraId });
    if (result.success) {
      notification.success({
        title: 'Avance académico exportado',
        description: 'La planilla se descargó con el mismo filtro de carrera de la pantalla.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintente en unos segundos.',
      });
    }
  }, [exportarAvance, avanceState.carreraId, notification]);

  const handleExportarDesercion = useCallback(async () => {
    const result = await exportarDesercion({
      gestionId: desercionState.gestionId,
      carreraId: desercionState.carreraId,
    });
    if (result.success) {
      notification.success({
        title: 'Deserción exportada',
        description: 'La planilla se descargó con los mismos filtros de la pantalla.',
      });
    } else {
      notification.error({
        title: 'No se pudo exportar',
        description: result.error || 'Reintente en unos segundos.',
      });
    }
  }, [exportarDesercion, desercionState.gestionId, desercionState.carreraId, notification]);

  const tabItems = useMemo(() => {
    /**
     * Contenido por pestaña. Avance/Deserción embeben sus paneles "dumb" con el
     * estado de esta página; las 3 de acompañamiento embeben su connector
     * existente (provider + contenido) en modo `embedded` — sin duplicar pantallas.
     */
    const tabContent = {
      [TAB_AVANCE]: () => <AvanceTabPanel {...avanceState} />,
      [TAB_DESERCION]: () => <DesercionTabPanel {...desercionState} />,
      [TAB_ALERTAS]: () => <AlertasRiesgoListConnector embedded />,
      [TAB_SESIONES]: () => <SesionesListConnector embedded />,
      [TAB_PANEL]: () => <PanelAcompanamientoConnector embedded />,
    };

    return SEGUIMIENTO_TAB_ORDER.filter(puedeTab).map((tabKey) => {
      const meta = getSeguimientoTabMeta(tabKey, { docente });
      const Icon = meta.icon;
      return {
        key: tabKey,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(
          <PermisoGuard codigo={meta.permiso} accion="LISTAR">
            {tabContent[tabKey]()}
          </PermisoGuard>,
        ),
      };
    });
  }, [puedeTab, docente, avanceState, desercionState]);

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab') ?? defaultTab;
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) return requested;
    return keys[0] ?? TAB_AVANCE;
  }, [searchParams, tabItems, defaultTab]);

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  const activeMeta = getSeguimientoTabMeta(activeKey, { docente });

  /**
   * Acciones de la cabecera del workspace: solo Avance/Deserción exportan desde
   * aquí (su estado vive en esta página). Las pestañas de acompañamiento llevan
   * sus filtros/acciones dentro del contenido embebido (su estado vive en el
   * provider de cada pestaña).
   */
  const panelActions = useMemo(() => {
    if (esPropio) return null;
    if (activeKey === TAB_AVANCE) {
      return (
        <ActionButton
          permiso={AVANCE_PERMISOS.avance}
          accion="EXPORTAR"
          variant="info"
          icon={<FileExcelOutlined />}
          loading={exportandoAvance}
          disabled={avanceState.isLoading || avanceState.totalSinFiltrar === 0}
          onClick={handleExportarAvance}
          title="Exporta el avance académico a Excel (mismo filtro de carrera)"
        >
          Exportar
        </ActionButton>
      );
    }
    if (activeKey === TAB_DESERCION) {
      return (
        <ActionButton
          permiso={AVANCE_PERMISOS.desercion}
          accion="EXPORTAR"
          variant="info"
          icon={<FileExcelOutlined />}
          loading={exportandoDesercion}
          disabled={desercionState.isLoading || desercionState.carreras.length === 0}
          onClick={handleExportarDesercion}
          title="Exporta la deserción a Excel (mismos filtros de gestión y carrera)"
        >
          Exportar
        </ActionButton>
      );
    }
    return null;
  }, [
    esPropio,
    activeKey,
    exportandoAvance,
    exportandoDesercion,
    avanceState.isLoading,
    avanceState.totalSinFiltrar,
    desercionState.isLoading,
    desercionState.carreras.length,
    handleExportarAvance,
    handleExportarDesercion,
  ]);

  // ---- Vista degradada «Mi avance» (rol ESTUDIANTE, alcance PROPIO) ----
  if (esPropio) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Mi avance" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Mi avance en el plan de estudios" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Materias que ya avanzó (aprobadas y convalidadas) sobre el total de su plan de
                  estudios, junto con su promedio histórico.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                {avanceState.error ? (
                  <Alert
                    type="error"
                    showIcon
                    title="No se pudo cargar su avance"
                    description={avanceState.error}
                  />
                ) : (
                  <MiAvancePanel fila={avanceState.filaPropia} />
                )}
              </div>
            </section>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  // Defensivo: la ruta ya exige `permisoAny`, pero si el usuario llega sin
  // ninguna pestaña visible se le informa en vez de renderizar tabs vacías.
  if (!tabItems.length) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Seguimiento académico" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert
              type="warning"
              showIcon
              title="No tiene permisos para consultar el seguimiento académico."
            />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Seguimiento académico" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader
                title={activeMeta?.title ?? 'Seguimiento académico'}
                actions={panelActions}
              />
              {activeMeta?.description ? (
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  {activeMeta.description}
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
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default SeguimientoAcademicoPage;
