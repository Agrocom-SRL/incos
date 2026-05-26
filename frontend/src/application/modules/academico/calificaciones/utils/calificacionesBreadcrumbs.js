/**
 * Breadcrumbs de calificaciones con rutas dinámicas (:asignacionId, :n) resueltas.
 */
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { notasCursoPath } from './calificacionesPaths.js';

const ROUTES_CON_MATERIA = new Set(['ACA-CAL-CUADERNO', 'ACA-CAL-BIM-CONSOLIDADO']);

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
 * @param {{ asignacionId?: string|number, n?: string|number, materia?: string }} [params]
 */
export const createCalificacionesBreadcrumbItems = (
  routeKey,
  rootKey,
  currentTitle = null,
  params = {},
) => {
  const { asignacionId, materia } = params;
  const items = createBreadcrumbItems(routeKey, rootKey, currentTitle);
  const resolved = items.map((item) =>
    item.href ? { ...item, href: resolveHref(item.href, params) } : item,
  );

  if (!materia || !ROUTES_CON_MATERIA.has(routeKey) || asignacionId == null) {
    return resolved;
  }

  const materiaItem = { href: notasCursoPath(asignacionId), title: materia };
  const idxNotas = resolved.findIndex((item) => item.title === 'Registro de notas');
  if (idxNotas >= 0) {
    resolved[idxNotas] = materiaItem;
    return resolved;
  }

  const insertAt = currentTitle ? resolved.length - 1 : resolved.length;
  resolved.splice(insertAt, 0, materiaItem);
  return resolved;
};
