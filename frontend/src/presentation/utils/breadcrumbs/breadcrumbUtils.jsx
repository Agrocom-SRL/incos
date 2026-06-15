/**
 * Breadcrumbs: resuelve padres con todas las rutas registradas (dominios MAT, ACA, …).
 */

import { getAllRoutes } from '@routes';

const buildBreadcrumbChain = (allRoutes, key, routeKey, breadcrumbItems, currentTitle) => {
  const route = allRoutes.find(r => r.key === key);
  if (!route) return;

  if (route.breadcrumbParent) {
    buildBreadcrumbChain(allRoutes, route.breadcrumbParent, routeKey, breadcrumbItems, currentTitle);
  } else if (route.menu?.parent) {
    buildBreadcrumbChain(allRoutes, route.menu.parent, routeKey, breadcrumbItems, currentTitle);
  }

  if (key !== routeKey || currentTitle === null) {
    const title = route.breadcrumbLabel || route.menu?.label || route.path;
    const item = route.element ? { href: route.path, title } : { title };
    breadcrumbItems.push(item);
  }
};

/**
 * @param {string} routeKey
 * @param {string} rootKey — fallback si no hay cadena de padres
 * @param {string|null} currentTitle
 */
export const createBreadcrumbItems = (
  routeKey,
  rootKey,
  currentTitle = null,
  fallbackIcon = null,
  fallbackLabel = 'Módulo'
) => {
  const allRoutes = getAllRoutes();
  const currentRoute = allRoutes.find(route => route.key === routeKey);

  if (!currentRoute) {
    return [{ href: '/', title: 'Inicio' }, { title: fallbackLabel }];
  }

  const breadcrumbItems = [{ href: '/', title: 'Inicio' }];

  const buildChain = (key) => {
    buildBreadcrumbChain(allRoutes, key, routeKey, breadcrumbItems, currentTitle);
  };

  if (currentRoute.breadcrumbParent) {
    buildChain(currentRoute.breadcrumbParent);
  } else if (currentRoute.menu?.parent) {
    buildChain(currentRoute.menu.parent);
  } else if (currentRoute.key !== rootKey) {
    const rootRoute = allRoutes.find(r => r.key === rootKey);
    if (rootRoute) {
      const title = rootRoute.breadcrumbLabel || rootRoute.menu?.label || rootRoute.path;
      breadcrumbItems.push(
        rootRoute.element ? { href: rootRoute.path, title } : { title }
      );
    }
  }

  if (currentTitle) {
    breadcrumbItems.push({ title: currentTitle });
  } else {
    const title = currentRoute.breadcrumbLabel || currentRoute.menu?.label || currentRoute.path;
    breadcrumbItems.push(
      currentRoute.element ? { href: currentRoute.path, title } : { title }
    );
  }

  return breadcrumbItems;
};
