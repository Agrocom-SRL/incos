/**
 * Complementarios — menú CFG (tabs: discapacidad, apoderados, idiomas, estados
 * civiles) + ABM y detalle de página completa por entidad (patrón CFG Académico):
 *
 *   /configuracion/complementarios                        → tabs (discapacidad | apoderados | idiomas | estados-civiles)
 *   /configuracion/complementarios/discapacidad/nueva      → crear tipo de discapacidad
 *   /configuracion/complementarios/discapacidad/:id/editar → editar tipo de discapacidad
 *   /configuracion/complementarios/discapacidad/:id        → detalle tipo de discapacidad
 *   /configuracion/complementarios/apoderado/...           → análogo apoderado (tipo de parentesco)
 *   /configuracion/complementarios/idioma/...              → análogo idioma
 *   /configuracion/complementarios/estado-civil/...         → análogo estado civil
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
  'configuracion.complementario.estado-civil',
];

const ComplementariosConnector = lazy(
  () => import('@configuracion/complementarios/connectors/ComplementariosConnector.jsx'),
);
const DiscapacidadFormCreateConnector = lazy(
  () => import('@configuracion/complementarios/connectors/DiscapacidadFormCreateConnector.jsx'),
);
const DiscapacidadFormEditConnector = lazy(
  () => import('@configuracion/complementarios/connectors/DiscapacidadFormEditConnector.jsx'),
);
const DiscapacidadDetailConnector = lazy(
  () => import('@configuracion/complementarios/connectors/DiscapacidadDetailConnector.jsx'),
);
const ApoderadoFormCreateConnector = lazy(
  () => import('@configuracion/complementarios/connectors/ApoderadoFormCreateConnector.jsx'),
);
const ApoderadoFormEditConnector = lazy(
  () => import('@configuracion/complementarios/connectors/ApoderadoFormEditConnector.jsx'),
);
const ApoderadoDetailConnector = lazy(
  () => import('@configuracion/complementarios/connectors/ApoderadoDetailConnector.jsx'),
);
const IdiomaFormCreateConnector = lazy(
  () => import('@configuracion/complementarios/connectors/IdiomaFormCreateConnector.jsx'),
);
const IdiomaFormEditConnector = lazy(
  () => import('@configuracion/complementarios/connectors/IdiomaFormEditConnector.jsx'),
);
const IdiomaDetailConnector = lazy(
  () => import('@configuracion/complementarios/connectors/IdiomaDetailConnector.jsx'),
);
const EstadoCivilFormCreateConnector = lazy(
  () => import('@configuracion/complementarios/connectors/EstadoCivilFormCreateConnector.jsx'),
);
const EstadoCivilFormEditConnector = lazy(
  () => import('@configuracion/complementarios/connectors/EstadoCivilFormEditConnector.jsx'),
);
const EstadoCivilDetailConnector = lazy(
  () => import('@configuracion/complementarios/connectors/EstadoCivilDetailConnector.jsx'),
);

export const complementariosRoutes = [
  // Discapacidad — ABM y detalle
  {
    path: '/configuracion/complementarios/discapacidad/nueva',
    element: <DiscapacidadFormCreateConnector />,
    key: 'CFG-DISCAPACIDAD-NUEVA',
    permiso: 'configuracion.complementario.discapacidad',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Nuevo tipo de discapacidad',
  },
  {
    path: '/configuracion/complementarios/discapacidad/:id/editar',
    element: <DiscapacidadFormEditConnector />,
    key: 'CFG-DISCAPACIDAD-EDITAR',
    permiso: 'configuracion.complementario.discapacidad',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Editar tipo de discapacidad',
  },
  {
    path: '/configuracion/complementarios/discapacidad/:id',
    element: <DiscapacidadDetailConnector />,
    key: 'CFG-DISCAPACIDAD-DETALLE',
    permiso: 'configuracion.complementario.discapacidad',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Detalle de tipo de discapacidad',
  },

  // Apoderado (tipo de parentesco) — ABM y detalle
  {
    path: '/configuracion/complementarios/apoderado/nueva',
    element: <ApoderadoFormCreateConnector />,
    key: 'CFG-APODERADO-NUEVA',
    permiso: 'configuracion.complementario.apoderados',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Nuevo apoderado',
  },
  {
    path: '/configuracion/complementarios/apoderado/:id/editar',
    element: <ApoderadoFormEditConnector />,
    key: 'CFG-APODERADO-EDITAR',
    permiso: 'configuracion.complementario.apoderados',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Editar apoderado',
  },
  {
    path: '/configuracion/complementarios/apoderado/:id',
    element: <ApoderadoDetailConnector />,
    key: 'CFG-APODERADO-DETALLE',
    permiso: 'configuracion.complementario.apoderados',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Detalle de apoderado',
  },

  // Idioma — ABM y detalle
  {
    path: '/configuracion/complementarios/idioma/nueva',
    element: <IdiomaFormCreateConnector />,
    key: 'CFG-IDIOMA-NUEVA',
    permiso: 'configuracion.complementario.idiomas',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Nuevo idioma',
  },
  {
    path: '/configuracion/complementarios/idioma/:id/editar',
    element: <IdiomaFormEditConnector />,
    key: 'CFG-IDIOMA-EDITAR',
    permiso: 'configuracion.complementario.idiomas',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Editar idioma',
  },
  {
    path: '/configuracion/complementarios/idioma/:id',
    element: <IdiomaDetailConnector />,
    key: 'CFG-IDIOMA-DETALLE',
    permiso: 'configuracion.complementario.idiomas',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Detalle de idioma',
  },

  // Estado civil — ABM y detalle
  {
    path: '/configuracion/complementarios/estado-civil/nueva',
    element: <EstadoCivilFormCreateConnector />,
    key: 'CFG-ESTADO-CIVIL-NUEVA',
    permiso: 'configuracion.complementario.estado-civil',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Nuevo estado civil',
  },
  {
    path: '/configuracion/complementarios/estado-civil/:id/editar',
    element: <EstadoCivilFormEditConnector />,
    key: 'CFG-ESTADO-CIVIL-EDITAR',
    permiso: 'configuracion.complementario.estado-civil',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Editar estado civil',
  },
  {
    path: '/configuracion/complementarios/estado-civil/:id',
    element: <EstadoCivilDetailConnector />,
    key: 'CFG-ESTADO-CIVIL-DETALLE',
    permiso: 'configuracion.complementario.estado-civil',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-COMPLEMENTARIO',
    breadcrumbLabel: 'Detalle de estado civil',
  },

  // Legacy
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

  // Entrada de menú (tabs)
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
