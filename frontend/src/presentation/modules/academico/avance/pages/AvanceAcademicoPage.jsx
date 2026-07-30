/**
 * Avance académico (ítem ACA-AVANCE · /academico/avance?tab=avance|desercion).
 *
 * Página con dos pestañas gateadas por permiso (disolución del módulo REP):
 *   - «Avance» (`academico.avance` LISTAR): estudiante × plan con % de avance.
 *   - «Deserción» (`academico.desercion` LISTAR): agregado carrera × gestión +
 *     detalle de desertores. El rol ESTUDIANTE no la ve (sin permiso).
 *
 * Rol ESTUDIANTE: el backend responde `alcance: 'PROPIO'` y la página degrada
 * a la ficha «Mi avance» (sin tabs ni filtros; labelByRole ya renombra el menú).
 *
 * Shell del prototipo CFG Académico (workspace + tabs); la orquestación de
 * datos vive en los hooks de estado (useAvanceAcademicoPage / useDesercionPage).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, App, Flex, Tabs, Typography } from 'antd';
import { FallOutlined, FileExcelOutlined, LineChartOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import { useAuthContext } from '@application-auth';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { AVANCE_PERMISOS } from '@application-academico/avance/utils/avancePermisos.js';
import { useAvanceAcademicoPage } from '@application-academico/avance/hooks/state/useAvanceAcademicoPage.js';
import { useDesercionPage } from '@application-academico/avance/hooks/state/useDesercionPage.js';
import { useExportAvanceAcademicoExcel } from '@application-academico/avance/hooks/api/useExportAvanceAcademicoExcel.js';
import { useExportDesercionExcel } from '@application-academico/avance/hooks/api/useExportDesercionExcel.js';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import AvanceTabPanel from '../components/AvanceTabPanel.jsx';
import DesercionTabPanel from '../components/DesercionTabPanel.jsx';
import MiAvancePanel from '../components/MiAvancePanel.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const TAB_AVANCE = 'avance';
const TAB_DESERCION = 'desercion';

/** Metadatos de cada pestaña (título del workspace + lede). */
const TAB_META = {
  [TAB_AVANCE]: {
    title: 'Avance académico por estudiante',
    shortLabel: 'Avance',
    icon: LineChartOutlined,
    description:
      'Materias avanzadas (aprobadas + convalidadas) sobre el total del plan de estudios de cada estudiante, con su promedio histórico. Reporte de solo lectura.',
  },
  [TAB_DESERCION]: {
    title: 'Deserción estudiantil',
    shortLabel: 'Deserción',
    icon: FallOutlined,
    description:
      'Métrica anual de abandono por estados consolidados de matrícula (abandono y retiro), agregada por carrera y gestión, con el detalle de desertores. Reporte de solo lectura.',
  },
};

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const AvanceAcademicoPage = () => {
  const { notification } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedeAvance = hasPermiso(AVANCE_PERMISOS.avance, 'LISTAR');
  const puedeDesercion = hasPermiso(AVANCE_PERMISOS.desercion, 'LISTAR');

  const avanceState = useAvanceAcademicoPage();
  const desercionState = useDesercionPage({ enabled: puedeDesercion });

  const esPropio = avanceState.alcance === 'PROPIO';

  const { exportar: exportarAvance, loading: exportandoAvance } = useExportAvanceAcademicoExcel();
  const { exportar: exportarDesercion, loading: exportandoDesercion } = useExportDesercionExcel();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-AVANCE', 'ACA', esPropio ? 'Mi avance' : null),
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
    const items = [];
    if (puedeAvance) {
      const meta = TAB_META[TAB_AVANCE];
      const Icon = meta.icon;
      items.push({
        key: TAB_AVANCE,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(
          <PermisoGuard codigo={AVANCE_PERMISOS.avance} accion="LISTAR">
            <AvanceTabPanel {...avanceState} />
          </PermisoGuard>,
        ),
      });
    }
    if (puedeDesercion) {
      const meta = TAB_META[TAB_DESERCION];
      const Icon = meta.icon;
      items.push({
        key: TAB_DESERCION,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(
          <PermisoGuard codigo={AVANCE_PERMISOS.desercion} accion="LISTAR">
            <DesercionTabPanel {...desercionState} />
          </PermisoGuard>,
        ),
      });
    }
    return items;
  }, [puedeAvance, puedeDesercion, avanceState, desercionState]);

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab');
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) return requested;
    return keys[0] ?? TAB_AVANCE;
  }, [searchParams, tabItems]);

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  const activeMeta = TAB_META[activeKey];

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

  if (!tabItems.length) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Avance académico" breadcrumbItems={breadcrumbItems} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert
              type="warning"
              showIcon
              title="No tiene permisos para consultar el avance académico."
            />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Avance académico" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader
                title={activeMeta?.title ?? 'Avance académico'}
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

export default AvanceAcademicoPage;
