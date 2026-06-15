/** Prefijo de contexto de vista por módulo (useRouteViewMode). */
export const VIEW_CONTEXT_STORAGE_PREFIX = 'incos:view-context:';

/** Claves legacy de calificaciones (antes de viewStack global). */
const LEGACY_SESSION_KEYS = ['incos:calificaciones-docente-coordinacion'];

/**
 * Limpia estado de navegación en sessionStorage (logout / cambio de usuario).
 */
export function clearSessionNavigationState() {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (!key) {
      continue;
    }
    if (key.startsWith(VIEW_CONTEXT_STORAGE_PREFIX) || LEGACY_SESSION_KEYS.includes(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}
