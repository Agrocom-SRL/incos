/**
 * Menú CFG → Complementarios: catálogos auxiliares (discapacidad, apoderados, idiomas).
 * URL: /configuracion/complementarios?tab=discapacidad|apoderados|idiomas
 *
 * Mismo shell "workspace" que AcademicoPage: header con ListPanelHeader (título +
 * botón crear del tab activo) + Tabs; cada tab embebe su lista (`embedded`).
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
  discapacidadNuevaPath,
  apoderadoNuevaPath,
  idiomaNuevaPath,
} from '@application-configuracion/complementarios/config/paths';
import {
  discapacidadesListNavigationState,
  apoderadosListNavigationState,
  idiomasListNavigationState,
} from '@application-configuracion/complementarios/config/navigation';
import DiscapacidadesList from './DiscapacidadesList';
import ApoderadosTabPanel from './ApoderadosTabPanel';
import IdiomasTabPanel from './IdiomasTabPanel';
import {
  TAB_APODERADOS,
  TAB_DISCAPACIDAD,
  TAB_IDIOMAS,
} from '@configuracion/complementarios/config/complementarioTabs';
import { COMPLEMENTARIO_TAB_PANEL_META } from '@configuracion/complementarios/config/complementarioTabPanels';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Complementarios' },
];

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const ComplementariosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedeDiscapacidad = hasPermiso('configuracion.complementario.discapacidad', 'LISTAR');
  const puedeApoderados = hasPermiso('configuracion.complementario.apoderados', 'LISTAR');
  const puedeIdiomas = hasPermiso('configuracion.complementario.idiomas', 'LISTAR');

  const discapacidadNavState = useMemo(() => discapacidadesListNavigationState(), []);
  const apoderadosNavState = useMemo(() => apoderadosListNavigationState(), []);
  const idiomasNavState = useMemo(() => idiomasListNavigationState(), []);

  const tabItems = useMemo(() => {
    const items = [];
    if (puedeDiscapacidad) {
      const meta = COMPLEMENTARIO_TAB_PANEL_META[TAB_DISCAPACIDAD];
      const Icon = meta.icon;
      items.push({
        key: TAB_DISCAPACIDAD,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<DiscapacidadesList embedded />),
      });
    }
    if (puedeApoderados) {
      const meta = COMPLEMENTARIO_TAB_PANEL_META[TAB_APODERADOS];
      const Icon = meta.icon;
      items.push({
        key: TAB_APODERADOS,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<ApoderadosTabPanel embedded />),
      });
    }
    if (puedeIdiomas) {
      const meta = COMPLEMENTARIO_TAB_PANEL_META[TAB_IDIOMAS];
      const Icon = meta.icon;
      items.push({
        key: TAB_IDIOMAS,
        label: (
          <span className="sd-tab-label">
            <Icon /> {meta.shortLabel}
          </span>
        ),
        children: wrapTabPanel(<IdiomasTabPanel embedded />),
      });
    }
    return items;
  }, [puedeDiscapacidad, puedeApoderados, puedeIdiomas]);

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab');
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) {
      return requested;
    }
    return keys[0] ?? TAB_DISCAPACIDAD;
  }, [searchParams, tabItems]);

  const activePanel = COMPLEMENTARIO_TAB_PANEL_META[activeKey];

  const panelActions = useMemo(() => {
    if (activeKey === TAB_DISCAPACIDAD) {
      return (
        <ActionButton
          permiso="configuracion.complementario.discapacidad"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(discapacidadNuevaPath, { state: discapacidadNavState })}
        >
          Nuevo tipo de discapacidad
        </ActionButton>
      );
    }
    if (activeKey === TAB_APODERADOS) {
      return (
        <ActionButton
          permiso="configuracion.complementario.apoderados"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(apoderadoNuevaPath, { state: apoderadosNavState })}
        >
          Nuevo apoderado
        </ActionButton>
      );
    }
    if (activeKey === TAB_IDIOMAS) {
      return (
        <ActionButton
          permiso="configuracion.complementario.idiomas"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(idiomaNuevaPath, { state: idiomasNavState })}
        >
          Nuevo idioma
        </ActionButton>
      );
    }
    return null;
  }, [activeKey, navigate, discapacidadNavState, apoderadosNavState, idiomasNavState]);

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
          <PageHeader title="Complementarios" breadcrumbItems={BREADCRUMB} />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert type="warning" showIcon title="No tiene permisos para acceder a complementarios." />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Complementarios" breadcrumbItems={BREADCRUMB} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title={activePanel?.title ?? 'Complementarios'} actions={panelActions} />
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

export default ComplementariosPage;
