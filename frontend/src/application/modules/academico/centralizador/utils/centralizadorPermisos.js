/**
 * Código de permiso del módulo Centralizador.
 *
 * El permiso vive en el dominio de calificaciones (seed 58:
 * `academico.calificacion.centralizador`), aunque el centralizador sea un módulo
 * de frontend propio. No se cambia el CODE para no tocar RBAC backend.
 */

export const CENTRALIZADOR_PERMISOS = {
  centralizador: 'academico.calificacion.centralizador',
};
