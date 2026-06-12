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
 * Fase 1: andamiaje con placeholders (UnderConstruction). Connectors/pages/hooks
 * reales se añaden en las fases siguientes (ver docs/plan/MODULO-ASISTENCIA.md).
 */

import { UnderConstruction } from '@components/pages';
import {
  ASISTENCIA_LANDING_STACK,
  ASISTENCIA_VIEW_STACK,
} from '@application-academico/asistencia/config/asistenciaViewStack.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';

export const asistenciaRoutes = [
  {
    path: '/academico/asistencia/mis-cursos/:asignacionId/planilla',
    element: <UnderConstruction />,
    key: 'ACA-ASI-PLANILLA',
    breadcrumbLabel: 'Planilla diaria',
    permiso: ASISTENCIA_PERMISOS.registroCuaderno,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-MIS-CURSOS',
  },
  {
    path: '/academico/asistencia/mis-cursos',
    element: <UnderConstruction />,
    key: 'ACA-ASI-MIS-CURSOS',
    breadcrumbLabel: 'Mis cursos',
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI',
    /** Modos de subpantallas → useRouteViewMode (propio; coordinación en fase Registro). */
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
    element: <UnderConstruction />,
    key: 'ACA-ASI-LIC',
    breadcrumbLabel: 'Licencias estudiantiles',
    permiso: ASISTENCIA_PERMISOS.licenciaVer,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI',
  },
  {
    path: '/academico/asistencia/licencias/solicitar',
    element: <UnderConstruction />,
    key: 'ACA-ASI-LIC-SOL',
    permiso: ASISTENCIA_PERMISOS.licenciaCrear,
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-LIC',
  },
  {
    path: '/academico/asistencia/licencias/aprobar',
    element: <UnderConstruction />,
    key: 'ACA-ASI-LIC-APR',
    permiso: ASISTENCIA_PERMISOS.licenciaAprobar,
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'ACA-ASI-LIC',
  },
  {
    path: '/academico/asistencia',
    element: <UnderConstruction />,
    key: 'ACA-ASI',
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
    menu: {
      label: 'Asistencia',
      module: 'ACA',
      parent: 'ACA',
      order: 6,
      labelByRole: { ESTUDIANTE: 'Mi asistencia' },
      /** Entrada menú → redirect a mis cursos (registro diario). */
      landingStack: ASISTENCIA_LANDING_STACK,
    },
  },
];

export default asistenciaRoutes;
