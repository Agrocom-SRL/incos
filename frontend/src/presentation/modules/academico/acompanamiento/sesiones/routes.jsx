/**
 * Acompañamiento → Sesiones de refuerzo (ítem del menú Académico, order 9).
 *
 * Permiso `academico.acompanamiento.sesion` (seed 59). Rutas estáticas ANTES
 * de `/:id` (React Router interceptaría /programar como id). La ruta con menú
 * va al final del array (patrón capacitacion/cursos).
 */

import { lazy } from 'react';
import {
  SESIONES_LIST_PATH,
  sesionProgramarPath,
} from '@application-academico/acompanamiento/config/paths';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';

const SesionesListConnector = lazy(() => import('./connectors/SesionesListConnector.jsx'));
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
    element: <SesionesListConnector />,
    key: 'ACA-SESIONES',
    permiso: ACOMPANAMIENTO_PERMISOS.sesion,
    accion: 'LISTAR',
    menu: {
      label: 'Sesiones de refuerzo',
      module: 'ACA',
      parent: 'ACA',
      order: 9,
    },
  },
];

export default sesionesRoutes;
