/**
 * Tutorías → Acompañamiento → Sesiones de refuerzo (ítem de menú TUT,
 * order 3).
 *
 * Permiso `tutorias.acompanamiento.sesion` (seed 66). Rutas estáticas ANTES
 * de `/:id` (React Router interceptaría /programar como id). La ruta con menú
 * va al final del array (patrón capacitacion/cursos).
 */

import { lazy } from 'react';
import {
  SESIONES_LIST_PATH,
  sesionProgramarPath,
} from '@application-tutorias/config/paths';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';

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
    key: 'TUT-SESIONES-PROGRAMAR',
    breadcrumbLabel: 'Programar sesión',
    permiso: TUTORIAS_PERMISOS.sesion,
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'TUT-SESIONES',
  },
  {
    path: `${SESIONES_LIST_PATH}/:id/editar`,
    element: <SesionRefuerzoFormEditConnector />,
    key: 'TUT-SESIONES-EDITAR',
    breadcrumbLabel: 'Editar sesión',
    permiso: TUTORIAS_PERMISOS.sesion,
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'TUT-SESIONES',
  },
  {
    path: `${SESIONES_LIST_PATH}/:id`,
    element: <SesionRefuerzoDetailConnector />,
    key: 'TUT-SESIONES-DETALLE',
    breadcrumbLabel: 'Detalle de sesión',
    permiso: TUTORIAS_PERMISOS.sesion,
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'TUT-SESIONES',
  },
  {
    path: SESIONES_LIST_PATH,
    element: <SesionesListConnector />,
    key: 'TUT-SESIONES',
    permiso: TUTORIAS_PERMISOS.sesion,
    accion: 'LISTAR',
    menu: {
      label: 'Sesiones de refuerzo',
      module: 'TUT',
      parent: 'ACA',
      order: 9,
    },
  },
];

export default sesionesRoutes;
