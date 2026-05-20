// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones (ítem de menú ACA).
 *
 * /academico/calificaciones → elegir docente (admin) o redirección (cuenta DOCENTE)
 * /academico/calificaciones/docente/:docenteId/cursos → cursos por paralelo
 * /academico/calificaciones/docente/:docenteId/curso/:asignacionId/plan → plan de evaluaciones
 * /academico/calificaciones/docente/:docenteId/curso/:asignacionId/notas → registro de notas
 */

import { lazy } from 'react';

const CalificacionesSeleccionDocenteConnector = lazy(
  () => import('./connectors/SeleccionDocenteConnector.jsx'),
);
const CalificacionesCursosConnector = lazy(() => import('./connectors/CursosConnector.jsx'));
const CalificacionesPlanConnector = lazy(() => import('./connectors/PlanConnector.jsx'));
const CalificacionesNotasConnector = lazy(() => import('./connectors/NotasConnector.jsx'));

export const calificacionesRoutes = [
  {
    path: '/academico/calificaciones',
    element: <CalificacionesSeleccionDocenteConnector />,
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
    path: '/academico/calificaciones/docente/:docenteId/cursos',
    element: <CalificacionesCursosConnector />,
    key: 'ACA-CAL-CURSOS',
    permiso: 'academico.calificacion.curso',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/plan',
    element: <CalificacionesPlanConnector />,
    key: 'ACA-CAL-PLAN',
    permiso: 'academico.calificacion.periodo',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-CURSOS',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/notas',
    element: <CalificacionesNotasConnector />,
    key: 'ACA-CAL-NOTAS',
    permiso: 'academico.calificacion.registrar.parcial',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-CURSOS',
  },
];

export default calificacionesRoutes;
