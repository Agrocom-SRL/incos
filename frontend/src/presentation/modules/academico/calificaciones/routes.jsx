// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones — un ítem de menú lateral (ACA-CAL).
 *
 * Permiso ≈ pantalla (seed 54, IDs 15-24):
 *   15 ingreso · 16 coordinación · 17 mis_cursos · 18 cuaderno
 *   19 política · 20 tablero · 21-24 operación cuaderno
 */

import { lazy } from 'react';

const PoliticaInstitucionalConnector = lazy(
  () => import('./connectors/PoliticaInstitucionalConnector.jsx'),
);
const TableroConnector = lazy(() => import('./connectors/TableroConnector.jsx'));
const CalificacionesEntradaConnector = lazy(
  () => import('./connectors/CalificacionesEntradaConnector.jsx'),
);
const MisCursosConnector = lazy(() => import('./connectors/MisCursosConnector.jsx'));
const CuadernoConnector = lazy(() => import('./connectors/CuadernoConnector.jsx'));

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
    path: '/academico/calificaciones/tablero',
    element: <TableroConnector />,
    key: 'ACA-CAL-TABLERO',
    permiso: 'academico.calificacion.tablero',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:cursoId',
    element: <CuadernoConnector />,
    key: 'ACA-CAL-CUADERNO',
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
