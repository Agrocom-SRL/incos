/**
 * Complementarios — menú CFG (tabs: discapacidad, apoderados, idiomas).
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import {
  COMPLEMENTARIOS_BASE,
  complementarioTabPath,
} from '@application-configuracion/complementarios/config/paths';
import { TAB_DISCAPACIDAD } from '@configuracion/complementarios/config/complementarioTabs';

const CFG_COMPLEMENTARIO_PERMISOS = [
  'configuracion.complementario.discapacidad',
  'configuracion.complementario.apoderados',
  'configuracion.complementario.idiomas',
];

const ComplementariosConnector = lazy(
  () => import('@configuracion/complementarios/connectors/ComplementariosConnector.jsx'),
);

export const complementariosRoutes = [
  {
    path: '/configuracion/datos-complementarios/discapacidad',
    element: <Navigate to={complementarioTabPath(TAB_DISCAPACIDAD)} replace />,
    key: 'CFG-DISCAPACIDAD-LEGACY-PATH',
    permiso: 'configuracion.complementario.discapacidad',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/configuracion/datos-complementarios',
    element: <Navigate to={COMPLEMENTARIOS_BASE} replace />,
    key: 'CFG-COMPLEMENTARIO-LEGACY-PATH',
    permiso: null,
    permisoAny: CFG_COMPLEMENTARIO_PERMISOS,
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: `${COMPLEMENTARIOS_BASE}/discapacidad`,
    element: <Navigate to={complementarioTabPath(TAB_DISCAPACIDAD)} replace />,
    key: 'CFG-DISCAPACIDAD-LEGACY',
    permiso: 'configuracion.complementario.discapacidad',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: COMPLEMENTARIOS_BASE,
    element: <ComplementariosConnector />,
    key: 'CFG-COMPLEMENTARIO',
    permiso: null,
    permisoAny: CFG_COMPLEMENTARIO_PERMISOS,
    accion: 'LISTAR',
    menu: {
      label: 'Datos Complementarios',
      module: 'CFG',
      parent: 'CFG',
      order: 3,
    },
  },
];

export default complementariosRoutes;
