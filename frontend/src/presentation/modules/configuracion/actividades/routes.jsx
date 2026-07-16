/**
 * Configuración → Actividades (catálogo maestro reutilizable entre gestiones).
 * Patrón ABM clásico (como Docentes), sin tabs:
 *
 *   /configuracion/actividades              → listado
 *   /configuracion/actividades/nueva        → crear
 *   /configuracion/actividades/:id/editar   → editar
 *   /configuracion/actividades/:id          → detalle
 *
 * Permiso único `configuracion.actividad` (renombrado desde
 * `configuracion.historial-actividades`, ya aplicado en BD real).
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ACTIVIDADES_BASE } from '@application-configuracion/actividades/config/paths';

const ActividadesListConnector = lazy(
  () => import('@configuracion/actividades/connectors/ActividadesListConnector.jsx'),
);
const ActividadFormCreateConnector = lazy(
  () => import('@configuracion/actividades/connectors/ActividadFormCreateConnector.jsx'),
);
const ActividadFormEditConnector = lazy(
  () => import('@configuracion/actividades/connectors/ActividadFormEditConnector.jsx'),
);
const ActividadDetailConnector = lazy(
  () => import('@configuracion/actividades/connectors/ActividadDetailConnector.jsx'),
);

export const actividadesRoutes = [
  {
    path: '/configuracion/historial-actividades',
    element: <Navigate to={ACTIVIDADES_BASE} replace />,
    key: 'CFG-HISTORIAL-ACTIVIDADES-LEGACY',
    permiso: 'configuracion.actividad',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: `${ACTIVIDADES_BASE}/nueva`,
    element: <ActividadFormCreateConnector />,
    key: 'CFG-ACTIVIDADES-NUEVA',
    permiso: 'configuracion.actividad',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CFG-ACTIVIDADES',
    breadcrumbLabel: 'Nueva actividad',
  },
  {
    path: `${ACTIVIDADES_BASE}/:id/editar`,
    element: <ActividadFormEditConnector />,
    key: 'CFG-ACTIVIDADES-EDITAR',
    permiso: 'configuracion.actividad',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CFG-ACTIVIDADES',
    breadcrumbLabel: 'Editar actividad',
  },
  {
    path: `${ACTIVIDADES_BASE}/:id`,
    element: <ActividadDetailConnector />,
    key: 'CFG-ACTIVIDADES-DETALLE',
    permiso: 'configuracion.actividad',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CFG-ACTIVIDADES',
    breadcrumbLabel: 'Detalle de actividad',
  },
  {
    path: ACTIVIDADES_BASE,
    element: <ActividadesListConnector />,
    key: 'CFG-ACTIVIDADES',
    permiso: 'configuracion.actividad',
    accion: 'LISTAR',
    menu: {
      label: 'Historial de actividades',
      module: 'CFG',
      parent: 'CFG',
      order: 6,
    },
  },
];

export default actividadesRoutes;
