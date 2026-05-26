/**
 * Modo de vista del módulo según viewStack en routes.jsx (estándar global).
 *
 * @example
 * // routes.jsx — en la ruta raíz del módulo (key del menú):
 * viewStack: [
 *   { id: 'coordinacion', permiso: '...coordinacion', persistContext: { stateKey: 'docenteId', nameKey: 'docenteNombre' } },
 *   { id: 'propio', permiso: '...mis_cursos' },
 * ],
 *
 * // hook de pantalla hija:
 * const { viewId, contextId, isView } = useRouteViewMode('ACA-CAL-MIS-CURSOS');
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { getAllRoutes } from '@routes';
import { findViewStackForRoute, resolveViewStack } from '../utils/resolveViewStack.js';

const STORAGE_PREFIX = 'incos:view-context:';

const leerStorage = (storageKey) => {
  if (!storageKey) return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildStateSlice = (viewStack, locationState) => {
  if (!locationState || !viewStack?.length) return {};
  const slice = {};
  for (const entry of viewStack) {
    const pc = entry.persistContext;
    if (!pc?.stateKey) continue;
    if (locationState[pc.stateKey] != null) {
      slice[pc.stateKey] = locationState[pc.stateKey];
    }
    if (pc.nameKey && locationState[pc.nameKey] != null) {
      slice[pc.nameKey] = locationState[pc.nameKey];
    }
  }
  return slice;
};

/**
 * @param {string} routeKey - key de la ruta actual (hija o raíz del módulo).
 */
export function useRouteViewMode(routeKey) {
  const location = useLocation();
  const { hasPermiso } = useAuth();

  const allRoutes = useMemo(() => getAllRoutes(), []);
  const stackMeta = useMemo(
    () => findViewStackForRoute(routeKey, allRoutes),
    [routeKey, allRoutes],
  );

  const storageKey = stackMeta?.moduleKey
    ? `${STORAGE_PREFIX}${stackMeta.moduleKey}`
    : null;

  const stateSlice = useMemo(
    () => buildStateSlice(stackMeta?.viewStack, location.state),
    [stackMeta?.viewStack, location.state],
  );

  const stored = useMemo(
    () => leerStorage(storageKey),
    [storageKey, stateSlice],
  );

  const resolved = useMemo(
    () =>
      stackMeta?.viewStack
        ? resolveViewStack(stackMeta.viewStack, hasPermiso, {
            state: stateSlice,
            stored,
          })
        : null,
    [stackMeta?.viewStack, hasPermiso, stateSlice, stored],
  );

  const viewId = resolved?.entry?.id ?? null;
  const contextId = resolved?.contextId ?? null;
  const contextName = resolved?.contextName ?? null;

  const activeEntry = resolved?.entry ?? null;
  const persistContext = activeEntry?.persistContext;

  useEffect(() => {
    if (!storageKey || !stackMeta?.viewStack) return;

    const tienePermisoPersist = stackMeta.viewStack.some((entry) => {
      if (!entry.persistContext) return false;
      return hasPermiso(entry.permiso, entry.accion ?? 'LISTAR');
    });

    if (!tienePermisoPersist) {
      sessionStorage.removeItem(storageKey);
      return;
    }

    if (persistContext?.stateKey && stateSlice[persistContext.stateKey] != null) {
      const payload = { [persistContext.stateKey]: stateSlice[persistContext.stateKey] };
      if (persistContext.nameKey && stateSlice[persistContext.nameKey] != null) {
        payload[persistContext.nameKey] = stateSlice[persistContext.nameKey];
      }
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    }
  }, [storageKey, stackMeta?.viewStack, hasPermiso, persistContext, stateSlice]);

  const limpiarContexto = useCallback(() => {
    if (storageKey) sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  const isView = useCallback((id) => viewId === id, [viewId]);

  return {
    viewId,
    contextId,
    contextName,
    isView,
    limpiarContexto,
    stack: stackMeta?.viewStack ?? null,
    moduleKey: stackMeta?.moduleKey ?? null,
  };
}
