/**
 * Breadcrumbs del módulo Libros de registro con rutas dinámicas (:id, :folioId)
 * resueltas a partir del registro de rutas. Espejo de `centralizadorBreadcrumbs.js`
 * (necesario porque `ACA-LIBROS-DETALLE`/`ACA-LIBROS-FOLIO` tienen segmentos
 * dinámicos en su cadena de padres).
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
 * @param {{ id?: string|number, folioId?: string|number }} [params]
 */
export const createLibrosBreadcrumbItems = (routeKey, rootKey, currentTitle = null, params = {}) => {
  const items = createBreadcrumbItems(routeKey, rootKey, currentTitle);
  return items.map((item) => (item.href ? { ...item, href: resolveHref(item.href, params) } : item));
};

export default createLibrosBreadcrumbItems;
