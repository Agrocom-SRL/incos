/**
 * Navegación Asistencia: landingStack (ítem de menú) + viewStack (subpantallas).
 * Gemelo de calificacionesViewStack. @see docs/referencia/matriz-permisos-sistema.md
 *
 * Nota: Asistencia no tiene un permiso de "coordinación" separado (a diferencia de
 * Calificaciones). El modo coordinación (ver cualquier docente) se habilita por ROL
 * sobre el mismo `registro.ver`; por eso el viewStack arranca solo con 'propio' y la
 * vista coordinación se resuelve en la fase del Registro funcional.
 */

import { MIS_CURSOS_PATH } from '../utils/asistenciaPaths.js';
import { ASISTENCIA_PERMISOS } from '../utils/asistenciaPermisos.js';

/** Al hacer clic en «Asistencia»: redirect a mis cursos (registro diario). */
export const ASISTENCIA_LANDING_STACK = [
  {
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
    redirectTo: MIS_CURSOS_PATH,
  },
];

/** En mis cursos / planilla: GET /mis-cursos (docente propio). Coordinación: fase Registro. */
export const ASISTENCIA_VIEW_STACK = [
  {
    id: 'propio',
    permiso: ASISTENCIA_PERMISOS.registroVer,
    accion: 'LISTAR',
  },
];
