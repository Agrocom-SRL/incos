// src/presentation/modules/academico/calificaciones/routes.jsx
/**
 * Calificaciones — un ítem de menú lateral (ACA-CAL).
 *
 * Permiso ≈ pantalla (seed 54, IDs 15-24):
 *   15 ingreso · 16 coordinación · 17 mis_cursos · 18 cuaderno
 *   19 política · 20 gestión_bimestres · 21-24 operación cuaderno
 */

import { lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  MIS_CURSOS_PATH,
  notasCursoPath,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';

const PoliticaInstitucionalConnector = lazy(
  () => import('./connectors/PoliticaInstitucionalConnector.jsx'),
);
const CalificacionesEntradaConnector = lazy(
  () => import('./connectors/CalificacionesEntradaConnector.jsx'),
);
const MisCursosConnector = lazy(() => import('./connectors/MisCursosConnector.jsx'));
const ConsolidadoConnector = lazy(() => import('./connectors/ConsolidadoConnector.jsx'));
const CuadernoConnector = lazy(() => import('./connectors/CuadernoConnector.jsx'));
const BimestreConsolidadoConnector = lazy(
  () => import('./connectors/BimestreConsolidadoConnector.jsx'),
);
/** Redirecciones legacy → rutas nuevas (docenteId en state). */
const RedirectDocenteCursos = () => {
  const { docenteId } = useParams();
  return (
    <Navigate
      to={MIS_CURSOS_PATH}
      replace
      state={{ docenteId: Number(docenteId), docenteNombre: null }}
    />
  );
};

const RedirectDocenteNotas = () => {
  const { docenteId, asignacionId } = useParams();
  return (
    <Navigate
      to={notasCursoPath(asignacionId)}
      replace
      state={{ docenteId: Number(docenteId), docenteNombre: null }}
    />
  );
};

const RedirectDocenteCuaderno = () => {
  const { docenteId, asignacionId, n } = useParams();
  return (
    <Navigate
      to={`${MIS_CURSOS_PATH}/${asignacionId}/cuaderno/${n}`}
      replace
      state={{ docenteId: Number(docenteId), docenteNombre: null }}
    />
  );
};

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
    path: '/academico/calificaciones/mis-cursos/:asignacionId/cuaderno/:n',
    element: <CuadernoConnector />,
    key: 'ACA-CAL-CUADERNO',
    breadcrumbLabel: 'Cuaderno',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-NOTAS',
  },
  {
    path: '/academico/calificaciones/mis-cursos/:asignacionId/bimestre/:n/consolidado',
    element: <BimestreConsolidadoConnector />,
    key: 'ACA-CAL-BIM-CONSOLIDADO',
    breadcrumbLabel: 'Consolidado bimestre',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-NOTAS',
  },
  {
    path: '/academico/calificaciones/mis-cursos/:asignacionId/notas',
    element: <ConsolidadoConnector />,
    key: 'ACA-CAL-NOTAS',
    breadcrumbLabel: 'Registro de notas',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL-MIS-CURSOS',
  },
  {
    path: '/academico/calificaciones/mis-cursos',
    element: <MisCursosConnector />,
    key: 'ACA-CAL-MIS-CURSOS',
    breadcrumbLabel: 'Mis cursos',
    permiso: 'academico.calificacion.mis_cursos',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CAL',
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/finales',
    element: <RedirectDocenteNotas />,
    key: 'ACA-CAL-LEGACY-FINALES',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/nivelacion',
    element: <RedirectDocenteNotas />,
    key: 'ACA-CAL-LEGACY-NIVELACION',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId/bimestre/:n',
    element: <RedirectDocenteCuaderno />,
    key: 'ACA-CAL-LEGACY-CUADERNO',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/academico/calificaciones/docente/:docenteId/curso/:asignacionId',
    element: <RedirectDocenteNotas />,
    key: 'ACA-CAL-LEGACY-CONSOLIDADO',
    permiso: 'academico.calificacion.cuaderno',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: '/academico/calificaciones/docente/:docenteId',
    element: <RedirectDocenteCursos />,
    key: 'ACA-CAL-LEGACY-DOCENTE',
    permiso: 'academico.calificacion.mis_cursos',
    accion: 'LISTAR',
    menu: null,
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
