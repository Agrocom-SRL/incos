/**
 * Menú CFG → Académico: catálogo plan-centrado + carreras/materias auxiliares.
 * URL: /configuracion/academico?tab=planes|carreras|materias
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
  carreraNuevaPath,
  materiaNuevaPath,
} from '@application-configuracion/academico/config/paths';
import {
  carrerasListNavigationState,
  materiasListNavigationState,
} from '@application-configuracion/academico/config/academicoNavigation';
import PlanesTabPanel from './PlanesTabPanel';
import CarrerasList from './CarrerasList';
import MateriasList from './MateriasList';
import { TAB_PLANES, TAB_CARRERAS, TAB_MATERIAS } from '@configuracion/academico/config/academicoTabs';
import { ACADEMICO_TAB_PANEL_META } from '@configuracion/academico/config/academicoTabPanels';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const { Paragraph } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Académico' },
];

const wrapTabPanel = (node) => (
  <div className="cfg-academico-tab-panel">{node}</div>
);

const AcademicoPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedePlanes = hasPermiso('configuracion.plan-estudio', 'LISTAR');
  const puedeCarreras = hasPermiso('configuracion.carrera', 'LISTAR');
  const puedeMaterias = hasPermiso('configuracion.materia', 'LISTAR');

  const carrerasNavState = useMemo(() => carrerasListNavigationState(), []);
  const materiasNavState = useMemo(() => materiasListNavigationState(), []);

  const tabItems = useMemo(() => {
    const items = [];
    if (puedePlanes) {
      const meta = ACADEMICO_TAB_PANEL_META[TAB_PLANES];
      const Icon = meta.icon;
      items.push({
        key: TAB_PLANES,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<PlanesTabPanel embedded />),
      });
    }
    if (puedeCarreras) {
      const meta = ACADEMICO_TAB_PANEL_META[TAB_CARRERAS];
      const Icon = meta.icon;
      items.push({
        key: TAB_CARRERAS,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<CarrerasList embedded />),
      });
    }
    if (puedeMaterias) {
      const meta = ACADEMICO_TAB_PANEL_META[TAB_MATERIAS];
      const Icon = meta.icon;
      items.push({
        key: TAB_MATERIAS,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<MateriasList embedded />),
      });
    }
    return items;
  }, [puedePlanes, puedeCarreras, puedeMaterias]);

  const activeKey = useMemo(() => {
    let requested = searchParams.get('tab');
    if (requested === 'prerrequisitos') {
      requested = TAB_PLANES;
    }
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) {
      return requested;
    }
    return keys[0] ?? TAB_PLANES;
  }, [searchParams, tabItems]);

  const activePanel = ACADEMICO_TAB_PANEL_META[activeKey];

  const panelActions = useMemo(() => {
    if (activeKey === TAB_CARRERAS) {
      return (
        <ActionButton
          permiso="configuracion.carrera"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(carreraNuevaPath, { state: carrerasNavState })}
        >
          Nueva carrera
        </ActionButton>
      );
    }
    if (activeKey === TAB_MATERIAS) {
      return (
        <ActionButton
          permiso="configuracion.materia"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(materiaNuevaPath, { state: materiasNavState })}
        >
          Nueva materia
        </ActionButton>
      );
    }
    return null;
  }, [activeKey, navigate, carrerasNavState, materiasNavState]);

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
          <PageHeader title="Catálogo académico" breadcrumbItems={BREADCRUMB} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="warning" showIcon message="No tiene permisos para acceder al módulo académico." />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Catálogo académico" breadcrumbItems={BREADCRUMB} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title={activePanel?.title ?? 'Académico'} actions={panelActions} />
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

export default AcademicoPage;
