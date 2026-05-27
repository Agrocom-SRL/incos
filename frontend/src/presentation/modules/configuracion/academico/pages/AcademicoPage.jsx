/**
 * Menú CFG → Académico: catálogo plan-centrado + carreras/materias auxiliares.
 * URL: /configuracion/academico?tab=planes|carreras|materias
 *
 * Prerrequisitos y matriz viven en PlanDetallePage (proceso transaccional del plan).
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Tabs } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import PlanesTabPanel from './PlanesTabPanel';
import CarrerasList from './CarrerasList';
import MateriasList from './MateriasList';
import { TAB_PLANES, TAB_CARRERAS, TAB_MATERIAS } from '@configuracion/academico/config/academicoTabs';

const BREADCRUMB = [
  { title: 'Inicio', href: '/' },
  { title: 'Configuración', href: '/configuracion' },
  { title: 'Académico' },
];

const AcademicoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedePlanes = hasPermiso('configuracion.plan-estudio', 'LISTAR');
  const puedeCarreras = hasPermiso('configuracion.carrera', 'LISTAR');
  const puedeMaterias = hasPermiso('configuracion.materia', 'LISTAR');

  const tabItems = useMemo(() => {
    const items = [];
    if (puedePlanes) {
      items.push({ key: TAB_PLANES, label: 'Plan de estudio', children: <PlanesTabPanel /> });
    }
    if (puedeCarreras) {
      items.push({ key: TAB_CARRERAS, label: 'Carreras', children: <CarrerasList /> });
    }
    if (puedeMaterias) {
      items.push({ key: TAB_MATERIAS, label: 'Materias', children: <MateriasList /> });
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
      <PageTemplate sidebar={null}>
        <Alert type="warning" message="No tiene permisos para acceder al módulo académico." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate sidebar={null}>
      <PageHeader title="Académico" breadcrumbItems={BREADCRUMB} />
      <Tabs activeKey={activeKey} items={tabItems} onChange={onTabChange} />
    </PageTemplate>
  );
};

export default AcademicoPage;
