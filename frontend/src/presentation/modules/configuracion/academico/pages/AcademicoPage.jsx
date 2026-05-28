/**
 * Menú CFG → Académico: catálogo plan-centrado + carreras/materias auxiliares.
 * URL: /configuracion/academico?tab=planes|carreras|materias
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Flex, Tabs, Typography } from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import PlanesTabPanel from './PlanesTabPanel';
import CarrerasList from './CarrerasList';
import MateriasList from './MateriasList';
import { TAB_PLANES, TAB_CARRERAS, TAB_MATERIAS } from '@configuracion/academico/config/academicoTabs';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const { Title, Paragraph } = Typography;

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Académico' },
];

const wrapTabPanel = (node) => (
  <div className="cfg-academico-tab-panel">{node}</div>
);

const AcademicoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedePlanes = hasPermiso('configuracion.plan-estudio', 'LISTAR');
  const puedeCarreras = hasPermiso('configuracion.carrera', 'LISTAR');
  const puedeMaterias = hasPermiso('configuracion.materia', 'LISTAR');

  const tabItems = useMemo(() => {
    const items = [];
    if (puedePlanes) {
      items.push({
        key: TAB_PLANES,
        label: (
          <span className="sd-tab-label">
            <ReadOutlined /> Plan de estudio
          </span>
        ),
        children: wrapTabPanel(<PlanesTabPanel embedded />),
      });
    }
    if (puedeCarreras) {
      items.push({
        key: TAB_CARRERAS,
        label: (
          <span className="sd-tab-label">
            <TeamOutlined /> Carreras
          </span>
        ),
        children: wrapTabPanel(<CarrerasList embedded />),
      });
    }
    if (puedeMaterias) {
      items.push({
        key: TAB_MATERIAS,
        label: (
          <span className="sd-tab-label">
            <BookOutlined /> Materias
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
          <PageHeader title="Académico" breadcrumbItems={BREADCRUMB} />
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
        <PageHeader title="Académico" breadcrumbItems={BREADCRUMB} />
      </PageHeaderArea>
      <DashboardPageShell>
        <MainContent>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <Title level={3} className="cfg-academico-workspace__title">
                Catálogo académico
              </Title>
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Administra planes de estudio, carreras y materias del instituto.
              </Paragraph>
            </header>

            <div className="sd-tabs-shell cfg-academico-tabs-shell">
              <Tabs
                className="sd-tabs cfg-academico-workspace__tabs"
                activeKey={activeKey}
                items={tabItems}
                onChange={onTabChange}
                destroyInactiveTabPane={false}
              />
            </div>
          </section>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default AcademicoPage;
