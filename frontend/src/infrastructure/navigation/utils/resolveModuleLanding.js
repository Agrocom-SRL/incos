/**
 * Resuelve la pantalla de aterrizaje de un ítem de menú según permisos RBAC.
 *
 * Patrón global documentado en docs/matriz-permisos-sistema.md § Entradas por permisos.
 * La prioridad la define el orden de `menu.landingStack` en routes.jsx (no el rol).
 *
 * @typedef {Object} LandingStackEntry
 * @property {string} permiso - Código del permiso (seed 54).
 * @property {string} [accion='LISTAR'] - Acción RBAC (seed 56).
 * @property {string} [redirectTo] - Si existe, redirige a esta ruta; si no, usa vista inline del conector.
 */

const DEFAULT_ACCION = 'LISTAR';

/**
 * @param {LandingStackEntry[]} landingStack
 * @param {(codigo: string, accion: string) => boolean} hasPermiso
 * @returns {{ type: 'redirect', path: string } | { type: 'inline' } | null}
 */
export function resolveModuleLanding(landingStack, hasPermiso) {
  if (!Array.isArray(landingStack) || landingStack.length === 0) {
    return null;
  }

  for (const entry of landingStack) {
    if (!entry?.permiso) continue;
    const accion = entry.accion ?? DEFAULT_ACCION;
    if (!hasPermiso(entry.permiso, accion)) continue;

    if (entry.redirectTo) {
      return { type: 'redirect', path: entry.redirectTo };
    }
    return { type: 'inline' };
  }

  return null;
}

/**
 * Ruta efectiva al hacer clic en el sidebar (misma regla que ModuleEntryConnector).
 *
 * @param {string} entryPath - path canónico del ítem de menú (routes[].path).
 * @param {LandingStackEntry[]} [landingStack]
 * @param {(codigo: string, accion: string) => boolean} hasPermiso
 * @returns {string|null}
 */
export function resolveEffectiveMenuPath(entryPath, landingStack, hasPermiso) {
  if (!entryPath) return null;

  const landing = resolveModuleLanding(landingStack, hasPermiso);
  if (landing?.type === 'redirect') return landing.path;
  if (landing?.type === 'inline') return entryPath;

  return entryPath;
}
