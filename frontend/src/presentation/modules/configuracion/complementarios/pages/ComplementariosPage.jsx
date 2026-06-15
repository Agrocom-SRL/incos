/**
 * Menú CFG → Complementarios (tabs compartidos).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Tabs } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import DiscapacidadesList from './DiscapacidadesList';
import ApoderadosTabPanel from './ApoderadosTabPanel';
import IdiomasTabPanel from './IdiomasTabPanel';
import {
  TAB_APODERADOS,
  TAB_DISCAPACIDAD,
  TAB_IDIOMAS,
} from '@configuracion/complementarios/config/complementarioTabs';

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Complementarios' },
];

const ComplementariosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedeDiscapacidad = hasPermiso('configuracion.complementario.discapacidad', 'LISTAR');
  const puedeApoderados = hasPermiso('configuracion.complementario.apoderados', 'LISTAR');
  const puedeIdiomas = hasPermiso('configuracion.complementario.idiomas', 'LISTAR');

  const tabItems = useMemo(() => {
    const items = [];
    if (puedeDiscapacidad) {
      items.push({ key: TAB_DISCAPACIDAD, label: 'Discapacidad', children: <DiscapacidadesList /> });
    }
    if (puedeApoderados) {
      items.push({ key: TAB_APODERADOS, label: 'Apoderados', children: <ApoderadosTabPanel /> });
    }
    if (puedeIdiomas) {
      items.push({ key: TAB_IDIOMAS, label: 'Idiomas', children: <IdiomasTabPanel /> });
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

  const onTabChange = useCallback(
    (key) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  if (!tabItems.length) {
    return (
      <PageTemplate sidebar={null}>
        <Alert type="warning" title="No tiene permisos para acceder a complementarios." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate sidebar={null}>
      <PageHeader title="Complementarios" breadcrumbItems={BREADCRUMB} />
      <Tabs activeKey={activeKey} items={tabItems} onChange={onTabChange} />
    </PageTemplate>
  );
};

export default ComplementariosPage;
