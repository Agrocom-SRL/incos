/**
 * Breadcrumbs del módulo Nivelación con rutas dinámicas (:paraleloGestionId)
 * resueltas a partir del registro de rutas. Espejo de
 * `centralizadorBreadcrumbs.js`/`librosBreadcrumbs.js`.
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
 * @param {{ paraleloGestionId?: string|number }} [params]
 */
export const createNivelacionBreadcrumbItems = (
  routeKey,
  rootKey,
  currentTitle = null,
  params = {},
) => {
  const items = createBreadcrumbItems(routeKey, rootKey, currentTitle);
  return items.map((item) => (item.href ? { ...item, href: resolveHref(item.href, params) } : item));
};

export default createNivelacionBreadcrumbItems;
