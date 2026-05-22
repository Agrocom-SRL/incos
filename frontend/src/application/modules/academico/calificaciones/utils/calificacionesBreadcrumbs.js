/**
 * Breadcrumbs de calificaciones con rutas dinámicas (:asignacionId, :n) resueltas.
 */
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';

const resolveHref = (href, params) => {
  if (!href || !params) return href;
  let resolved = href;
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    resolved = resolved.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  return resolved;
};

/**
 * @param {string} routeKey
 * @param {string} rootKey
 * @param {string|null} currentTitle
 * @param {{ asignacionId?: string|number, n?: string|number }} [params]
 */
export const createCalificacionesBreadcrumbItems = (
  routeKey,
  rootKey,
  currentTitle = null,
  params = {},
) => {
  const items = createBreadcrumbItems(routeKey, rootKey, currentTitle);
  return items.map((item) =>
    item.href ? { ...item, href: resolveHref(item.href, params) } : item,
  );
};
