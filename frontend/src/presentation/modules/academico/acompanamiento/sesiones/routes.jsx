/**
 * Acompañamiento → Sesiones de refuerzo (ACA · rutas legadas
 * /academico/acompanamiento/sesiones*).
 *
 * Agrupación 2026-08-01 («Seguimiento académico», ítem ACA-SEGUIMIENTO): el
 * listado dejó de ser entrada de sidebar (era order 9); su URL queda como
 * GEMELA del contenedor con la pestaña «Sesiones de refuerzo» por defecto.
 * Las subrutas del ABM (programar / :id / :id/editar) conservan sus páginas
 * propias y encadenan breadcrumbParent → ACA-SESIONES → ACA-SEGUIMIENTO para
 * resaltar el nuevo ítem en el sidebar.
 *
 * Permiso `academico.acompanamiento.sesion` (seed 59, sin cambios). Rutas
 * estáticas ANTES de `/:id` (React Router interceptaría /programar como id).
 */

import { lazy } from 'react';
import {
  SESIONES_LIST_PATH,
  sesionProgramarPath,
} from '@application-academico/acompanamiento/config/paths';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import { TAB_SESIONES } from '@academico/seguimiento/config/seguimientoTabs';

const SeguimientoAcademicoConnector = lazy(
  () => import('@academico/seguimiento/connectors/SeguimientoAcademicoConnector.jsx'),
);
const SesionRefuerzoFormCreateConnector = lazy(
  () => import('./connectors/SesionRefuerzoFormCreateConnector.jsx'),
);
const SesionRefuerzoFormEditConnector = lazy(
  () => import('./connectors/SesionRefuerzoFormEditConnector.jsx'),
);
const SesionRefuerzoDetailConnector = lazy(
  () => import('./connectors/SesionRefuerzoDetailConnector.jsx'),
);

export const sesionesRoutes = [
  {
    path: sesionProgramarPath,
    element: <SesionRefuerzoFormCreateConnector />,
    key: 'ACA-SESIONES-PROGRAMAR',
    breadcrumbLabel: 'Programar sesión',
    permiso: ACOMPANAMIENTO_PERMISOS.sesion,
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-SESIONES',
  },
  {
    path: `${SESIONES_LIST_PATH}/:id/editar`,
    element: <SesionRefuerzoFormEditConnector />,
    key: 'ACA-SESIONES-EDITAR',
    breadcrumbLabel: 'Editar sesión',
    permiso: ACOMPANAMIENTO_PERMISOS.sesion,
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'ACA-SESIONES',
  },
  {
    path: `${SESIONES_LIST_PATH}/:id`,
    element: <SesionRefuerzoDetailConnector />,
    key: 'ACA-SESIONES-DETALLE',
    breadcrumbLabel: 'Detalle de sesión',
    permiso: ACOMPANAMIENTO_PERMISOS.sesion,
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'ACA-SESIONES',
  },
  {
    path: SESIONES_LIST_PATH,
    element: <SeguimientoAcademicoConnector defaultTab={TAB_SESIONES} />,
    key: 'ACA-SESIONES',
    breadcrumbLabel: 'Sesiones de refuerzo',
    permiso: ACOMPANAMIENTO_PERMISOS.sesion,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-SEGUIMIENTO',
  },
];

export default sesionesRoutes;
