/**
 * Menú CFG → Recursos académicos: catálogos de referencia usados por Oferta académica
 * (Paralelos maestro, Aulas y Tipos de evaluación).
 * URL: /configuracion/recursos?tab=paralelos|aulas|tipos-evaluacion
 *
 * Mismo shell "workspace" que AcademicoPage/ComplementariosPage: header con
 * ListPanelHeader (título + botón crear del tab activo) + Tabs; cada tab embebe
 * su lista (`embedded`).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Flex, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import { useAuthContext } from '@application-auth';
import {
  paraleloNuevaPath,
  aulaNuevaPath,
  tipoEvaluacionNuevaPath,
} from '@application-configuracion/recursos/config/paths';
import {
  paralelosListNavigationState,
  aulasListNavigationState,
  tiposEvaluacionListNavigationState,
} from '@application-configuracion/recursos/config/navigation';
import ParalelosList from './ParalelosList';
import AulasList from './AulasList';
import TiposEvaluacionList from './TiposEvaluacionList';
import { TAB_PARALELOS, TAB_AULAS, TAB_TIPOS_EVALUACION } from '@configuracion/recursos/config/recursosTabs';
import { RECURSOS_TAB_PANEL_META } from '@configuracion/recursos/config/recursosTabPanels';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Recursos académicos' },
];

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const RecursosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedeParalelos = hasPermiso('configuracion.paralelo', 'LISTAR');
  const puedeAulas = hasPermiso('configuracion.aula', 'LISTAR');
  const puedeTiposEvaluacion = hasPermiso('configuracion.tipo-evaluacion', 'LISTAR');

  const paralelosNavState = useMemo(() => paralelosListNavigationState(), []);
  const aulasNavState = useMemo(() => aulasListNavigationState(), []);
  const tiposEvaluacionNavState = useMemo(() => tiposEvaluacionListNavigationState(), []);

  const tabItems = useMemo(() => {
    const items = [];
    if (puedeParalelos) {
      const meta = RECURSOS_TAB_PANEL_META[TAB_PARALELOS];
      const Icon = meta.icon;
      items.push({
        key: TAB_PARALELOS,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<ParalelosList embedded />),
      });
    }
    if (puedeAulas) {
      const meta = RECURSOS_TAB_PANEL_META[TAB_AULAS];
      const Icon = meta.icon;
      items.push({
        key: TAB_AULAS,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<AulasList embedded />),
      });
    }
    if (puedeTiposEvaluacion) {
      const meta = RECURSOS_TAB_PANEL_META[TAB_TIPOS_EVALUACION];
      const Icon = meta.icon;
      items.push({
        key: TAB_TIPOS_EVALUACION,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<TiposEvaluacionList embedded />),
      });
    }
    return items;
  }, [puedeParalelos, puedeAulas, puedeTiposEvaluacion]);

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab');
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) {
      return requested;
    }
    return keys[0] ?? TAB_PARALELOS;
  }, [searchParams, tabItems]);

  const activePanel = RECURSOS_TAB_PANEL_META[activeKey];

  const panelActions = useMemo(() => {
    if (activeKey === TAB_PARALELOS) {
      return (
        <ActionButton
          permiso="configuracion.paralelo"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(paraleloNuevaPath, { state: paralelosNavState })}
        >
          Nuevo paralelo
        </ActionButton>
      );
    }
    if (activeKey === TAB_AULAS) {
      return (
        <ActionButton
          permiso="configuracion.aula"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(aulaNuevaPath, { state: aulasNavState })}
        >
          Nueva aula
        </ActionButton>
      );
    }
    if (activeKey === TAB_TIPOS_EVALUACION) {
      return (
        <ActionButton
          permiso="configuracion.tipo-evaluacion"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(tipoEvaluacionNuevaPath, { state: tiposEvaluacionNavState })}
        >
          Nuevo tipo de evaluación
        </ActionButton>
      );
    }
    return null;
  }, [activeKey, navigate, paralelosNavState, aulasNavState, tiposEvaluacionNavState]);

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  if (!tabItems.length) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader title="Recursos académicos" breadcrumbItems={BREADCRUMB} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="warning" showIcon title="No tiene permisos para acceder a recursos académicos." />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Recursos académicos" breadcrumbItems={BREADCRUMB} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title={activePanel?.title ?? 'Recursos académicos'} actions={panelActions} />
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
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default RecursosPage;
