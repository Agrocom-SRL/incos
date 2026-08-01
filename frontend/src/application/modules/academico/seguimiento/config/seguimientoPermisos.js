/**
 * Permisos del ítem Seguimiento académico (ACA-SEGUIMIENTO). CERO permisos
 * nuevos: el ítem agrupa pantallas existentes y reutiliza sus códigos del
 * seed 59 tal cual (cada pestaña se gatea con el permiso que su pantalla ya
 * usaba como ítem de menú independiente).
 *
 * Gating del ítem/ruta: `permisoAny` (patrón CFG-ACADEMICO, ver
 * `hasAnyPermiso`) — visible si el usuario tiene ≥1 de estos permisos con
 * acción LISTAR. Así ningún rol con al menos una pantalla pierde el ítem
 * (ESTUDIANTE solo avance, SEC_ACADEMICA solo alertas, DOCENTE avance +
 * alertas + sesiones, RECTOR/DIR_ACADEMICO las cinco).
 */

import { AVANCE_PERMISOS } from '@application-academico/avance/utils/avancePermisos.js';
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';

export const SEGUIMIENTO_PERMISOS_ANY = [
  AVANCE_PERMISOS.avance,
  AVANCE_PERMISOS.desercion,
  ACOMPANAMIENTO_PERMISOS.alerta,
  ACOMPANAMIENTO_PERMISOS.sesion,
  ACOMPANAMIENTO_PERMISOS.panel,
];

export default SEGUIMIENTO_PERMISOS_ANY;
