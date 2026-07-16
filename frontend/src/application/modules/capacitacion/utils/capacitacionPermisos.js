/**
 * Códigos de permiso del dominio Capacitación (CAP) — espejo del seed 65
 * (`65-seed-permisos-cap.sql`). Fuente única para rutas, ActionButton,
 * TableActions y PermisoGuard del módulo (misma acción en las 3 capas,
 * ver skill incos-rbac).
 *
 * Acciones por permiso (vocabulario v2):
 * - curso:        LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR
 * - participante: LISTAR, DETALLE, CREAR, EDITAR
 * - inscripcion:  LISTAR, DETALLE, CREAR, ELIMINAR
 * - pago:         CREAR, EXPORTAR
 */
export const CAPACITACION_PERMISOS = {
  curso: 'capacitacion.curso',
  participante: 'capacitacion.participante',
  inscripcion: 'capacitacion.inscripcion',
  pago: 'capacitacion.pago',
};
