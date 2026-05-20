// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones (ítem de menú ACA).
 *
 * /academico/calificaciones → cursos por paralelo
 * /academico/calificaciones/curso/:asignacionId/plan → plan de evaluaciones
 * /academico/calificaciones/curso/:asignacionId/notas → registro de notas
 */

import { lazy } from 'react';

const CalificacionesCursosConnector = lazy(() => import('./connectors/CursosConnector.jsx'));
const CalificacionesPlanConnector = lazy(() => import('./connectors/PlanConnector.jsx'));
const CalificacionesNotasConnector = lazy(() => import('./connectors/NotasConnector.jsx'));

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
    path: '/academico/calificaciones/curso/:asignacionId/plan',
    element: <CalificacionesPlanConnector />,
    key: 'ACA-CAL-PLAN',
    permiso: 'academico.calificacion.periodo',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones/curso/:asignacionId/notas',
    element: <CalificacionesNotasConnector />,
    key: 'ACA-CAL-NOTAS',
    permiso: 'academico.calificacion.registrar.parcial',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
];

export default calificacionesRoutes;
