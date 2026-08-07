// src/presentation/modules/academico/nivelaciones/routes.jsx
/**
 * Nivelaciones (ítem de menú ACA). Materias ARRASTRADAS de gestiones
 * anteriores (`historial_matricula`+`nivelaciones`, schema 16). Dominio
 * separado de Centralizador (decisión de arquitectura confirmada, ver
 * docs/plan/calificaciones-centralizador-nivelacion-rediseno.md), conectado
 * solo por badges cruzados (`CentralizadorNivelacionBadge`/"Ver en
 * Centralizador").
 *
 * Flujo de 2 niveles en /listar (P1 nivel 1 paralelos → P1 nivel 2 grilla del
 * paralelo) + /inscribir (registrar evento/programar examen) + /aprobar
 * (resultado de examen / decisión administrativa). Backend en
 * `/api/v1/nivelaciones`.
 */

import { lazy } from 'react';

const NivelacionListarConnector = lazy(() => import('./connectors/NivelacionListarConnector.jsx'));
const NivelacionParaleloConnector = lazy(
  () => import('./connectors/NivelacionParaleloConnector.jsx'),
);
const NivelacionInscribirConnector = lazy(
  () => import('./connectors/NivelacionInscribirConnector.jsx'),
);
const NivelacionAprobarConnector = lazy(() => import('./connectors/NivelacionAprobarConnector.jsx'));

export const nivelacionesRoutes = [
  {
    // P1 nivel 2 — grilla estudiantes × asignaturas del paralelo elegido.
    path: '/academico/nivelaciones/listar/:paraleloGestionId',
    element: <NivelacionParaleloConnector />,
    key: 'ACA-NIV-GRID',
    breadcrumbLabel: 'Grilla del paralelo',
    permiso: 'academico.nivelacion.ver',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
  {
    // P1 nivel 1 — paralelos en gestión vigente, con conteo de pendientes.
    path: '/academico/nivelaciones/listar',
    element: <NivelacionListarConnector />,
    key: 'ACA-NIV',
    permiso: 'academico.nivelacion.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Nivelaciones',
      module: 'ACA',
      parent: 'ACA',
      order: 3,
      labelByRole: { ESTUDIANTE: 'Mi nivelación' },
    },
  },
  {
    path: '/academico/nivelaciones/inscribir',
    element: <NivelacionInscribirConnector />,
    key: 'ACA-NIV-INSCRIBIR',
    breadcrumbLabel: 'Registrar evento',
    permiso: 'academico.nivelacion.inscribir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
  {
    path: '/academico/nivelaciones/aprobar',
    element: <NivelacionAprobarConnector />,
    key: 'ACA-NIV-APROBAR',
    breadcrumbLabel: 'Aprobar nivelaciones',
    permiso: 'academico.nivelacion.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-NIV',
  },
];

export default nivelacionesRoutes;
