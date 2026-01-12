/**
 * breadcrumbHelpers - Funciones genéricas para construir breadcrumbs
 * 
 * Single Responsibility: Proporcionar funciones reutilizables para generar breadcrumbs
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades de UI (breadcrumbs son parte de la presentación)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo genera breadcrumbs, no tiene otra responsabilidad
 * - Open/Closed: Fácil de extender agregando nuevas funciones sin modificar existentes
 * - Dependency Inversion: Depende de abstracciones (rutas), no de implementaciones
 * 
 * Estas funciones son genéricas y pueden ser usadas por cualquier módulo
 */

import { HomeOutlined } from '@ant-design/icons';
import { getModuleIcon } from './moduleIcons';

/**
 * Construye recursivamente la cadena de breadcrumbs
 * 
 * @param {Array} routes - Array de rutas del módulo
 * @param {string} key - Key de la ruta actual
 * @param {string} routeKey - Key de la ruta objetivo
 * @param {string} rootKey - Key del módulo raíz
 * @param {Array} breadcrumbItems - Array donde se acumulan los items
 * @param {string|null} currentTitle - Título actual (si existe, es el último item)
 */
const buildBreadcrumbChain = (routes, key, routeKey, rootKey, breadcrumbItems, currentTitle) => {
  const route = routes.find(r => r.key === key);
  if (!route) return;

  // Si tiene padre, agregarlo primero (recursión)
  if (route.menu?.parent) {
    buildBreadcrumbChain(routes, route.menu.parent, routeKey, rootKey, breadcrumbItems, currentTitle);
  }

  // Agregar la ruta actual (solo si no es la última)
  if (key !== routeKey || currentTitle === null) {
    const isRoot = key === rootKey;
    const ModuleIcon = getModuleIcon(rootKey);
    
    breadcrumbItems.push({
      href: route.path,
      title: isRoot ? (
        <>
          <ModuleIcon />
          <span>{route.menu?.label || route.path}</span>
        </>
      ) : route.menu?.label || route.path,
    });
  }
};

/**
 * Crea los items del breadcrumb basándose en la ruta actual
 * 
 * @param {Array} routes - Array de rutas del módulo
 * @param {string} routeKey - Key de la ruta (ej: 'EST', 'EST-REGISTRAR', 'INS-CREATE')
 * @param {string} rootKey - Key del módulo raíz (ej: 'EST', 'INS')
 * @param {string|null} currentTitle - Título actual de la página (para el último item del breadcrumb)
 * @param {React.ComponentType} fallbackIcon - Icono por defecto si no se encuentra el módulo
 * @param {string} fallbackLabel - Label por defecto si no se encuentra el módulo
 * @returns {Array} Array de items del breadcrumb para Ant Design
 */
export const createBreadcrumbItems = (
  routes,
  routeKey,
  rootKey,
  currentTitle = null,
  fallbackIcon = null,
  fallbackLabel = 'Módulo'
) => {
  // Buscar la ruta actual
  const currentRoute = routes.find(route => route.key === routeKey);
  
  if (!currentRoute) {
    // Si no se encuentra la ruta, retornar breadcrumb básico
    const FallbackIcon = fallbackIcon || getModuleIcon(rootKey);
    return [
      {
        href: '/',
        title: <HomeOutlined />,
      },
      {
        title: (
          <>
            <FallbackIcon />
            <span>{fallbackLabel}</span>
          </>
        ),
      },
    ];
  }

  // Construir la jerarquía de breadcrumbs desde la raíz
  const breadcrumbItems = [];
  
  // Siempre agregar Home como primer item
  breadcrumbItems.push({
    href: '/',
    title: <HomeOutlined />,
  });

  // Construir la cadena de padres usando función recursiva
  const buildChain = (key) => {
    buildBreadcrumbChain(routes, key, routeKey, rootKey, breadcrumbItems, currentTitle);
  };

  // Construir la cadena hasta el padre
  if (currentRoute.menu?.parent) {
    buildChain(currentRoute.menu.parent);
  } else if (currentRoute.key !== rootKey) {
    // Si no tiene parent pero no es la raíz, agregar la raíz
    const rootRoute = routes.find(r => r.key === rootKey);
    if (rootRoute) {
      const RootIcon = getModuleIcon(rootKey);
      breadcrumbItems.push({
        href: rootRoute.path,
        title: (
          <>
            <RootIcon />
            <span>{rootRoute.menu?.label || rootRoute.path}</span>
          </>
        ),
      });
    }
  }

  // Agregar el item actual (si hay currentTitle, es el último item sin href)
  if (currentTitle) {
    breadcrumbItems.push({
      title: currentTitle,
    });
  } else {
    breadcrumbItems.push({
      href: currentRoute.path,
      title: currentRoute.menu?.label || currentRoute.path,
    });
  }

  return breadcrumbItems;
};
