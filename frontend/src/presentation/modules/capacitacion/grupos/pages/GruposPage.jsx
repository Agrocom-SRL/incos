/**
 * Menú Capacitación → Grupos: tab «Horarios» (ABM del catálogo) y tab «Grupos»
 * (solo lectura de los grupos de todos los cursos).
 * URL: /capacitacion/grupos?tab=horarios|grupos
 *
 * Mismo shell «workspace» que RecursosPage/AcademicoPage: header con
 * ListPanelHeader (título del tab activo + «Nuevo horario» solo en «Horarios»)
 * + Tabs; cada tab embebe su lista. Página "dumb": la orquestación vive en
 * `useGruposPage`.
 */

import { Flex, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useGruposPage } from '@application-capacitacion/grupos/hooks/state/useGruposPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  GRUPOS_TAB_GRUPOS,
  GRUPOS_TAB_HORARIOS,
} from '@application-capacitacion/config/paths';
import { GRUPOS_TAB_PANEL_META } from '../config/gruposTabPanels';
import HorariosList from './HorariosList';
import GruposList from './GruposList';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const wrapTabPanel = (node) => <div className="cfg-academico-tab-panel">{node}</div>;

const tabLabel = (key) => {
  const { icon: Icon, shortLabel } = GRUPOS_TAB_PANEL_META[key];
  return (
    <span className="sd-tab-label">
      <Icon /> {shortLabel}
    </span>
  );
};

const TAB_ITEMS = [
  { key: GRUPOS_TAB_HORARIOS, label: tabLabel(GRUPOS_TAB_HORARIOS), children: wrapTabPanel(<HorariosList />) },
  { key: GRUPOS_TAB_GRUPOS, label: tabLabel(GRUPOS_TAB_GRUPOS), children: wrapTabPanel(<GruposList />) },
];

const GruposPage = () => {
  const { activeKey, onTabChange, handleNuevoHorario, breadcrumbItems } = useGruposPage();
  const panel = GRUPOS_TAB_PANEL_META[activeKey];

  const panelActions =
    activeKey === GRUPOS_TAB_HORARIOS ? (
      <ActionButton
        permiso={CAPACITACION_PERMISOS.grupo}
        accion="CREAR"
        variant="primary"
        icon={<PlusOutlined />}
        onClick={handleNuevoHorario}
      >
        Nuevo horario
      </ActionButton>
    ) : null;

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Grupos" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title={panel.title} actions={panelActions} />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                {panel.description}
              </Paragraph>
            </header>

            <div className="sd-tabs-shell cfg-academico-tabs-shell">
              <Tabs
                className="sd-tabs cfg-academico-workspace__tabs"
                activeKey={activeKey}
                items={TAB_ITEMS}
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

export default GruposPage;
