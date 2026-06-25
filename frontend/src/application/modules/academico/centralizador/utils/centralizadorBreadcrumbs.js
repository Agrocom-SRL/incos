/**
 * Breadcrumbs del módulo Centralizador con rutas dinámicas
 * (:paraleloGestionId, :n) resueltas a partir del registro de rutas.
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
 * @param {string} routeKey clave de la ruta actual
 * @param {string} rootKey clave raíz de fallback
 * @param {string|null} currentTitle
 * @param {{ paraleloGestionId?: string|number, n?: string|number }} [params]
 */
export const createCentralizadorBreadcrumbItems = (
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
