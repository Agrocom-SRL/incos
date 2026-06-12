/**
 * Navegación Asistencia: landingStack (ítem de menú) + viewStack (subpantallas).
 * Gemelo de calificacionesViewStack. @see docs/referencia/matriz-permisos-sistema.md
 *
 * Admin con `coordinacion` → entra a la página de elegir docente (inline).
 * Docente (solo `registro.ver`) → redirect directo a sus cursos.
 */

import { MIS_CURSOS_PATH } from '../utils/asistenciaPaths.js';
import { ASISTENCIA_PERMISOS } from '../utils/asistenciaPermisos.js';

/** Al hacer clic en «Asistencia»: coordinación inline o redirect a mis cursos. */
export const ASISTENCIA_LANDING_STACK = [
  {
    permiso: ASISTENCIA_PERMISOS.coordinacion,
    accion: 'LISTAR',
  },
  {
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
    redirectTo: MIS_CURSOS_PATH,
  },
];

/** En mis cursos / planilla: API coordinación (docenteId en contexto) vs GET /mis-cursos. */
export const ASISTENCIA_VIEW_STACK = [
  {
    id: 'coordinacion',
    permiso: ASISTENCIA_PERMISOS.coordinacion,
    accion: 'LISTAR',
    persistContext: { stateKey: 'docenteId', nameKey: 'docenteNombre' },
  },
  {
    id: 'propio',
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
  },
];
