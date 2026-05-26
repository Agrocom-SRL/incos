/**
 * Resuelve el modo de vista activo según viewStack + permisos (patrón global).
 *
 * Diferencia con landingStack:
 *   - landingStack → entrada del ítem de menú (ModuleEntryConnector).
 *   - viewStack → subpantallas del mismo módulo (API / UI según perfil efectivo).
 *
 * @typedef {Object} ViewStackPersistContext
 * @property {string} stateKey - Clave en location.state (ej. docenteId).
 * @property {string} [nameKey] - Clave opcional para nombre en state/storage.
 *
 * @typedef {Object} ViewStackEntry
 * @property {string} [id] - Identificador estable (ej. 'coordinacion', 'propio').
 * @property {string} permiso
 * @property {string} [accion='LISTAR']
 * @property {ViewStackPersistContext} [persistContext] - Requiere id en state o storage para activar este modo.
 */

const DEFAULT_ACCION = 'LISTAR';

/**
 * @param {ViewStackEntry[]} viewStack
 * @param {(codigo: string, accion: string) => boolean} hasPermiso
 * @param {{ state?: Record<string, unknown>, stored?: Record<string, unknown> | null }} [context]
 * @returns {{ entry: ViewStackEntry, contextId: number|string|null, contextName: string|null } | null}
 */
export function resolveViewStack(viewStack, hasPermiso, context = {}) {
  if (!Array.isArray(viewStack) || viewStack.length === 0) {
    return null;
  }

  const { state = {}, stored = null } = context;

  for (const entry of viewStack) {
    if (!entry?.permiso) continue;
    const accion = entry.accion ?? DEFAULT_ACCION;
    if (!hasPermiso(entry.permiso, accion)) continue;

    if (entry.persistContext?.stateKey) {
      const { stateKey, nameKey } = entry.persistContext;
      const rawId = state[stateKey] ?? stored?.[stateKey] ?? null;
      if (rawId == null) continue;

      const contextName =
        nameKey != null
          ? state[nameKey] ?? stored?.[nameKey] ?? null
          : null;

      return {
        entry,
        contextId: rawId,
        contextName,
      };
    }

    return { entry, contextId: null, contextName: null };
  }

  return null;
}

/**
 * Busca viewStack en la ruta o en ancestros (breadcrumbParent / menu.parent).
 *
 * @param {string} routeKey
 * @param {Array<{ key?: string, viewStack?: ViewStackEntry[], breadcrumbParent?: string, menu?: { parent?: string } }>} allRoutes
 * @returns {{ viewStack: ViewStackEntry[], moduleKey: string } | null}
 */
export function findViewStackForRoute(routeKey, allRoutes) {
  if (!routeKey || !allRoutes?.length) return null;

  const visited = new Set();
  let key = routeKey;

  while (key && !visited.has(key)) {
    visited.add(key);
    const route = allRoutes.find((r) => r.key === key);
    if (!route) break;

    if (Array.isArray(route.viewStack) && route.viewStack.length > 0) {
      return { viewStack: route.viewStack, moduleKey: route.key };
    }

    key = route.breadcrumbParent ?? route.menu?.parent ?? null;
  }

  return null;
}
