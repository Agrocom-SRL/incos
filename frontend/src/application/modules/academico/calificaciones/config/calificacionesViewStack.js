/**
 * Navegación Calificaciones: landingStack (menú) + viewStack (subpantallas).
 * @see docs/referencia/matriz-permisos-sistema.md § landingStack / viewStack
 */

import { MIS_CURSOS_PATH } from '../utils/calificacionesPaths.js';
import { CALIFICACIONES_PERMISOS } from '../utils/calificacionesPermisos.js';

/** Al hacer clic en «Calificaciones»: coordinación inline o redirect a mis cursos. */
export const CALIFICACIONES_LANDING_STACK = [
  {
    permiso: CALIFICACIONES_PERMISOS.coordinacion,
    accion: 'LISTAR',
  },
  {
    permiso: CALIFICACIONES_PERMISOS.misCursos,
    accion: 'LISTAR',
    redirectTo: MIS_CURSOS_PATH,
  },
];

/** En mis cursos / cuaderno: API coordinación (docenteId en contexto) vs GET /mis-cursos. */
export const CALIFICACIONES_VIEW_STACK = [
  {
    id: 'coordinacion',
    permiso: CALIFICACIONES_PERMISOS.coordinacion,
    accion: 'LISTAR',
    persistContext: { stateKey: 'docenteId', nameKey: 'docenteNombre' },
  },
  {
    id: 'propio',
    permiso: CALIFICACIONES_PERMISOS.misCursos,
    accion: 'LISTAR',
  },
];
