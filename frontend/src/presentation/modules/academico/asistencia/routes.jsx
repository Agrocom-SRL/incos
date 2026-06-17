// src/presentation/modules/academico/asistencia/routes.jsx
/**
 * Asistencia — un ítem de menú lateral de Académico (ACA-ASI), gemelo de Calificaciones.
 *
 * Un solo ítem de menú con varias páginas (todas menu: null salvo la entrada):
 *   entrada → mis cursos (registro diario) → planilla diaria;
 *   + clases no dictadas, consolidado %, licencias estudiantiles.
 *
 * Permiso ≈ pantalla (seeds 54/56/55, prefijo academico.asistencia.*):
 *   registro.ver · registro.cuaderno · clase_no_dictada.ver · consolidado.ver
 *   licencia.ver/crear/aprobar (renombrados desde academico.licencia.*).
 *
 * Entrada (ACA-ASI): coordinación inline (elegir docente) o redirect a mis-cursos
 * según landingStack. Planilla/clases-no-dictadas/consolidado/licencias: placeholders
 * hasta sus fases (ver docs/plan/MODULO-ASISTENCIA.md).
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';
import {
  ASISTENCIA_LANDING_STACK,
  ASISTENCIA_VIEW_STACK,
} from '@application-academico/asistencia/config/asistenciaViewStack.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

const AsistenciaEntradaConnector = lazy(
  () => import('./connectors/AsistenciaEntradaConnector.jsx'),
);
const MisCursosAsistenciaConnector = lazy(
  () => import('./connectors/MisCursosAsistenciaConnector.jsx'),
);
const CalendarioAsistenciaConnector = lazy(
  () => import('./connectors/CalendarioAsistenciaConnector.jsx'),
);
const PlanillaAsistenciaSemanalConnector = lazy(
  () => import('./connectors/PlanillaAsistenciaSemanalConnector.jsx'),
);
const LicenciasListConnector = lazy(
  () => import('./connectors/LicenciasListConnector.jsx'),
);
const LicenciaSolicitarConnector = lazy(
  () => import('./connectors/LicenciaSolicitarConnector.jsx'),
);
const LicenciasAprobarConnector = lazy(
  () => import('./connectors/LicenciasAprobarConnector.jsx'),
);
const LicenciaDetailConnector = lazy(
  () => import('./connectors/LicenciaDetailConnector.jsx'),
);

export const asistenciaRoutes = [
  {
    path: '/academico/asistencia/mis-cursos/:asignacionId/planilla',
    element: <PlanillaAsistenciaSemanalConnector />,
    key: 'ACA-ASI-PLANILLA',
    breadcrumbLabel: 'Planilla semanal',
    permiso: ASISTENCIA_PERMISOS.registroCuaderno,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-MIS-CURSOS',
  },
  {
    path: '/academico/asistencia/mis-cursos/:asignacionId/calendario',
    element: <CalendarioAsistenciaConnector />,
    key: 'ACA-ASI-CALENDARIO',
    breadcrumbLabel: 'Calendario de asistencia',
    permiso: ASISTENCIA_PERMISOS.registroCuaderno,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-PLANILLA',
  },
  {
    path: '/academico/asistencia/mis-cursos',
    element: <MisCursosAsistenciaConnector />,
    key: 'ACA-ASI-MIS-CURSOS',
    breadcrumbLabel: 'Mis cursos',
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI',
    /** Modos de subpantallas → useRouteViewMode (coordinación con docenteId | propio). */
    viewStack: ASISTENCIA_VIEW_STACK,
  },
  {
    path: '/academico/asistencia/clases-no-dictadas',
    element: <UnderConstruction />,
    key: 'ACA-ASI-CND',
    breadcrumbLabel: 'Clases no dictadas',
    permiso: ASISTENCIA_PERMISOS.claseNoDictadaVer,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI',
  },
  {
    path: '/academico/asistencia/consolidado',
    element: <UnderConstruction />,
    key: 'ACA-ASI-CONS',
    breadcrumbLabel: 'Consolidado %',
    permiso: ASISTENCIA_PERMISOS.consolidadoVer,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI',
  },
  {
    path: '/academico/asistencia/licencias/listar',
    element: <LicenciasListConnector />,
    key: 'ACA-ASI-LIC',
    breadcrumbLabel: 'Licencias estudiantiles',
    permiso: ASISTENCIA_PERMISOS.licenciaVer,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI',
  },
  {
    path: '/academico/asistencia/licencias/solicitar',
    element: <LicenciaSolicitarConnector />,
    key: 'ACA-ASI-LIC-SOL',
    breadcrumbLabel: 'Solicitar licencia',
    permiso: ASISTENCIA_PERMISOS.licenciaCrear,
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-LIC',
  },
  {
    path: '/academico/asistencia/licencias/aprobar',
    element: <LicenciasAprobarConnector />,
    key: 'ACA-ASI-LIC-APR',
    breadcrumbLabel: 'Aprobar licencias',
    permiso: ASISTENCIA_PERMISOS.licenciaAprobar,
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-LIC',
  },
  {
    // Ruta dinámica DESPUÉS de las estáticas (listar/solicitar/aprobar) — incos-frontend-module §6.
    path: '/academico/asistencia/licencias/:id',
    element: <LicenciaDetailConnector />,
    key: 'ACA-ASI-LIC-DET',
    breadcrumbLabel: 'Detalle de la licencia',
    permiso: ASISTENCIA_PERMISOS.licenciaVer,
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'ACA-ASI-LIC',
  },
  {
    path: '/academico/asistencia',
    element: <AsistenciaEntradaConnector />,
    key: 'ACA-ASI',
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
    menu: {
      label: 'Asistencia',
      module: 'ACA',
      parent: 'ACA',
      order: 1,
      labelByRole: { ESTUDIANTE: 'Mi asistencia' },
      /** Entrada menú → coordinación inline (elegir docente) | redirect mis cursos. */
      landingStack: ASISTENCIA_LANDING_STACK,
    },
    /** viewStack también en la raíz para que useRouteViewMode lo herede. */
    viewStack: ASISTENCIA_VIEW_STACK,
  },
];

export default asistenciaRoutes;
