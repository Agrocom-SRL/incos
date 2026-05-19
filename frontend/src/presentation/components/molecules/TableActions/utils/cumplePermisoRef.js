/**
 * Evalúa si el usuario cumple al menos uno de los permisos indicados (OR).
 *
 * @param {{ codigo: string, accion: string } | Array<{ codigo: string, accion: string }> | undefined} ref
 * @param {(codigo: string, accion: string) => boolean} hasPermiso
 * @returns {boolean}
 */
export function cumplePermisoRef(ref, hasPermiso) {
  if (!ref) return true;
  const opciones = Array.isArray(ref) ? ref : [ref];
  return opciones.some((p) => p?.codigo && hasPermiso(p.codigo, p.accion));
}
