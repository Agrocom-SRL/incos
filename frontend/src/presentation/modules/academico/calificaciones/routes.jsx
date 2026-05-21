// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones — un ítem de menú lateral (ACA-CAL).
 *
 * Permiso ≈ pantalla (seed 54, IDs 15-24):
 *   15 ingreso · 16 coordinación · 17 mis_cursos · 18 cuaderno
 *   19 política · 20 gestión_bimestres · 21-24 operación cuaderno
 */

import { lazy } from 'react';

const PoliticaInstitucionalConnector = lazy(
  () => import('./connectors/PoliticaInstitucionalConnector.jsx'),
);
const GestionBimestresConnector = lazy(
  () => import('./connectors/GestionBimestresConnector.jsx'),
);
const CalificacionesEntradaConnector = lazy(
  () => import('./connectors/CalificacionesEntradaConnector.jsx'),
);
const MisCursosConnector = lazy(() => import('./connectors/MisCursosConnector.jsx'));
const CuadernoConnector = lazy(() => import('./connectors/CuadernoConnector.jsx'));
const EvaluacionesFinalesPlaceholderConnector = lazy(
  () => import('./connectors/EvaluacionesFinalesPlaceholderConnector.jsx'),
);
const NivelacionPlaceholderConnector = lazy(
  () => import('./connectors/NivelacionPlaceholderConnector.jsx'),
);

export const calificacionesRoutes = [
  {
    path: '/academico/calificaciones/politica',
    element: <PoliticaInstitucionalConnector />,
    key: 'ACA-CAL-POLITICA',
    permiso: 'academico.calificacion.politica',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones/gestion-bimestres',
    element: <GestionBimestresConnector />,
    key: 'ACA-CAL-GESTION-BIMESTRES',
    permiso: 'academico.calificacion.gestion_bimestres',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/finales',
    element: <EvaluacionesFinalesPlaceholderConnector />,
    key: 'ACA-CAL-CURSO-FINALES',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-CUADERNO',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/nivelacion',
    element: <NivelacionPlaceholderConnector />,
    key: 'ACA-CAL-CURSO-NIVELACION',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-CUADERNO',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/bimestre/:n',
    element: <CuadernoConnector />,
    key: 'ACA-CAL-CUADERNO',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-CUADERNO',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId',
    element: <CuadernoConnector />,
    key: 'ACA-CAL-CONSOLIDADO',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-DOCENTE-CURSOS',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId',
    element: <MisCursosConnector />,
    key: 'ACA-CAL-DOCENTE-CURSOS',
    permiso: 'academico.calificacion.mis_cursos',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones',
    element: <CalificacionesEntradaConnector />,
    key: 'ACA-CAL',
    permiso: 'academico.calificacion.ingreso',
    accion: 'LISTAR',
    menu: {
      label: 'Calificaciones',
      module: 'ACA',
      parent: 'ACA',
      order: 1,
      labelByRole: { ESTUDIANTE: 'Mis calificaciones' },
    },
  },
];

export default calificacionesRoutes;
