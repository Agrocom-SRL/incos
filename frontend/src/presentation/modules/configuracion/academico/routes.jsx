/**
 * Configuración → Académico
 *
 *   /configuracion/academico                    → tabs (planes | carreras | materias | paralelos)
 *   /configuracion/academico/carrera/nueva      → crear carrera
 *   /configuracion/academico/carrera/:id/editar → editar carrera
 *   /configuracion/academico/carrera/:id        → detalle carrera
 *   /configuracion/academico/materia/...        → análogo materia
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ACADEMICO_BASE, academicoTabPath } from '@application-configuracion/academico/config/paths';
import { TAB_CARRERAS, TAB_MATERIAS } from '@configuracion/academico/config/academicoTabs';

const CFG_ACADEMICO_PERMISOS = [
  'configuracion.plan-estudio',
  'configuracion.carrera',
  'configuracion.materia',
  'configuracion.paralelo',
];

const AcademicoConnector = lazy(
  () => import('@configuracion/academico/connectors/AcademicoConnector.jsx'),
);
const CarreraFormCreateConnector = lazy(
  () => import('@configuracion/academico/connectors/CarreraFormCreateConnector.jsx'),
);
const CarreraFormEditConnector = lazy(
  () => import('@configuracion/academico/connectors/CarreraFormEditConnector.jsx'),
);
const CarreraDetailConnector = lazy(
  () => import('@configuracion/academico/connectors/CarreraDetailConnector.jsx'),
);
const MateriaFormCreateConnector = lazy(
  () => import('@configuracion/academico/connectors/MateriaFormCreateConnector.jsx'),
);
const MateriaFormEditConnector = lazy(
  () => import('@configuracion/academico/connectors/MateriaFormEditConnector.jsx'),
);
const MateriaDetailConnector = lazy(
  () => import('@configuracion/academico/connectors/MateriaDetailConnector.jsx'),
);
const ParaleloFormCreateConnector = lazy(
  () => import('@configuracion/academico/connectors/ParaleloFormCreateConnector.jsx'),
);
const ParaleloFormEditConnector = lazy(
  () => import('@configuracion/academico/connectors/ParaleloFormEditConnector.jsx'),
);
const ParaleloDetailConnector = lazy(
  () => import('@configuracion/academico/connectors/ParaleloDetailConnector.jsx'),
);
export const academicoConfigRoutes = [
  {
    path: '/configuracion/academico/carrera/nueva',
    element: <CarreraFormCreateConnector />,
    key: 'CFG-CARRERA-NUEVA',
    permiso: 'configuracion.carrera',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Nueva carrera',
  },
  {
    path: '/configuracion/academico/materia/nueva',
    element: <MateriaFormCreateConnector />,
    key: 'CFG-MATERIA-NUEVA',
    permiso: 'configuracion.materia',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Nueva materia',
  },
  {
    path: '/configuracion/academico/paralelo/nueva',
    element: <ParaleloFormCreateConnector />,
    key: 'CFG-PARALELO-NUEVA',
    permiso: 'configuracion.paralelo',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Nuevo paralelo',
  },
  {
    path: '/configuracion/academico/carrera/:id/editar',
    element: <CarreraFormEditConnector />,
    key: 'CFG-CARRERA-EDITAR',
    permiso: 'configuracion.carrera',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Editar carrera',
  },
  {
    path: '/configuracion/academico/materia/:id/editar',
    element: <MateriaFormEditConnector />,
    key: 'CFG-MATERIA-EDITAR',
    permiso: 'configuracion.materia',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Editar materia',
  },
  {
    path: '/configuracion/academico/paralelo/:id/editar',
    element: <ParaleloFormEditConnector />,
    key: 'CFG-PARALELO-EDITAR',
    permiso: 'configuracion.paralelo',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Editar paralelo',
  },
  {
    path: '/configuracion/academico/carrera/:id',
    element: <CarreraDetailConnector />,
    key: 'CFG-CARRERA-DETALLE',
    permiso: 'configuracion.carrera',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle de carrera',
  },
  {
    path: '/configuracion/academico/materia/:id',
    element: <MateriaDetailConnector />,
    key: 'CFG-MATERIA-DETALLE',
    permiso: 'configuracion.materia',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle de materia',
  },
  {
    path: '/configuracion/academico/paralelo/:id',
    element: <ParaleloDetailConnector />,
    key: 'CFG-PARALELO-DETALLE',
    permiso: 'configuracion.paralelo',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACADEMICO',
    breadcrumbLabel: 'Detalle de paralelo',
  },
  {
    path: '/configuracion/academico/carreras',
    element: <Navigate to={academicoTabPath(TAB_CARRERAS)} replace />,
    key: 'CFG-CARRERAS-LEGACY',
    permiso: 'configuracion.carrera',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/configuracion/academico/materias',
    element: <Navigate to={academicoTabPath(TAB_MATERIAS)} replace />,
    key: 'CFG-MATERIAS-LEGACY',
    permiso: 'configuracion.materia',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: ACADEMICO_BASE,
    element: <AcademicoConnector />,
    key: 'CFG-ACADEMICO',
    permiso: null,
    permisoAny: CFG_ACADEMICO_PERMISOS,
    accion: 'LISTAR',
    menu: {
      label: 'Académico',
      module: 'CFG',
      parent: 'CFG',
      order: 1,
    },
  },
];

export default academicoConfigRoutes;
