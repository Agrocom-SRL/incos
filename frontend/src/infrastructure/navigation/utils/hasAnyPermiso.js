/**
 * RBAC: al menos un permiso del listado (secciones CFG sin permiso único de menú).
 */

export function hasAnyPermiso(permisoAny, hasPermisoFn, accion = 'LISTAR') {
  if (!Array.isArray(permisoAny) || permisoAny.length === 0) return true;
  return permisoAny.some((codigo) => hasPermisoFn(codigo, accion));
}
