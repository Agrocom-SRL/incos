// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones (ítem de menú ACA).
 *
 * /academico/calificaciones — cursos del docente (título de página: "Mis cursos")
 * /academico/calificaciones/:cursoId — cuaderno del curso
 */

import { lazy } from 'react';

const CalificacionesCursosConnector = lazy(
  () => import('./connectors/CalificacionesCursosConnector.jsx'),
);
const CuadernoConnector = lazy(() => import('./connectors/CuadernoConnector.jsx'));

export const calificacionesRoutes = [
  {
    path: '/academico/calificaciones',
    element: <CalificacionesCursosConnector />,
    key: 'ACA-CAL',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: {
      label: 'Calificaciones',
      module: 'ACA',
      parent: 'ACA',
      order: 1,
      labelByRole: { ESTUDIANTE: 'Mis calificaciones' },
    },
  },
  {
    path: '/academico/calificaciones/:cursoId',
    element: <CuadernoConnector />,
    key: 'ACA-CAL-CUADERNO',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
];

export default calificacionesRoutes;
