// src/presentation/modules/academico/centralizador/routes.jsx
/**
 * Centralizador de calificaciones — módulo de menú propio (ACA-CENTRALIZADOR),
 * hermano de Calificaciones. Flujo de 3 niveles:
 *   P1 paralelos → P2 bimestres del paralelo → P3 matriz por bimestre.
 *
 * El permiso es `academico.calificacion.centralizador` (seed 58, vive en BD);
 * el endpoint backend sigue siendo /calificaciones/centralizador.
 */

import { lazy } from 'react';

const CentralizadorConnector = lazy(() => import('./connectors/CentralizadorConnector.jsx'));
const CentralizadorBimestresConnector = lazy(
  () => import('./connectors/CentralizadorBimestresConnector.jsx'),
);
const CentralizadorMatrizConnector = lazy(
  () => import('./connectors/CentralizadorMatrizConnector.jsx'),
);

export const centralizadorRoutes = [
  {
    // P3 — matriz estudiantes × asignaturas del bimestre elegido.
    path: '/academico/centralizador/:paraleloGestionId/bimestre/:n',
    element: <CentralizadorMatrizConnector />,
    key: 'ACA-CENTRALIZADOR-MATRIZ',
    breadcrumbLabel: 'Matriz por bimestre',
    permiso: 'academico.calificacion.centralizador',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CENTRALIZADOR-BIMESTRES',
  },
  {
    // P2 — bimestres del paralelo elegido.
    path: '/academico/centralizador/:paraleloGestionId',
    element: <CentralizadorBimestresConnector />,
    key: 'ACA-CENTRALIZADOR-BIMESTRES',
    breadcrumbLabel: 'Bimestres',
    permiso: 'academico.calificacion.centralizador',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-CENTRALIZADOR',
  },
  {
    // P1 — grilla de paralelos. Ítem de menú propio (hermano de Calificaciones).
    path: '/academico/centralizador',
    element: <CentralizadorConnector />,
    key: 'ACA-CENTRALIZADOR',
    breadcrumbLabel: 'Centralizador',
    permiso: 'academico.calificacion.centralizador',
    accion: 'LISTAR',
    menu: {
      label: 'Centralizador',
      module: 'ACA',
      parent: 'ACA',
      order: 2.5,
    },
  },
];

export default centralizadorRoutes;
