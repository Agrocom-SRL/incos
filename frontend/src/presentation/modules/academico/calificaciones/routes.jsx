// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones — flujo docente (cuaderno).
 *
 * /mis-cursos — cursos del docente logueado
 * /mis-cursos/:cursoId — cuaderno del curso
 */

import { lazy } from 'react';

const MisCursosConnector = lazy(() => import('./connectors/MisCursosConnector.jsx'));
const CuadernoConnector = lazy(() => import('./connectors/CuadernoConnector.jsx'));

export const calificacionesRoutes = [
  {
    path: '/mis-cursos',
    element: <MisCursosConnector />,
    key: 'ACA-CAL',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: {
      label: 'Mis cursos',
      module: 'ACA',
      parent: 'ACA',
      order: 1,
      labelByRole: { ESTUDIANTE: 'Mis calificaciones' },
    },
  },
  {
    path: '/mis-cursos/:cursoId',
    element: <CuadernoConnector />,
    key: 'ACA-CAL-CUADERNO',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
];

export default calificacionesRoutes;
