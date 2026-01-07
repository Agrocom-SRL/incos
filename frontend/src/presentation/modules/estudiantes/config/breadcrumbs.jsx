/**
 * breadcrumbs - Configuración de breadcrumbs para el módulo de estudiantes
 * 
 * Single Responsibility: Generar breadcrumbs basándose en las rutas del módulo
 * 
 * Este archivo separa la configuración de breadcrumbs de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los breadcrumbs sin tocar el componente.
 */

import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { estudiantesRoutes } from '@estudiantes/routes';

/**
 * Crea los items del breadcrumb basándose en la ruta actual
 * 
 * @param {string} routeKey - Key de la ruta (ej: 'EST', 'EST-REGISTRAR', 'EST-LIST')
 * @param {string} currentTitle - Título actual de la página (para el último item del breadcrumb)
 * @returns {Array} Array de items del breadcrumb para Ant Design
 */
export const createBreadcrumbItems = (routeKey, currentTitle = null) => {
  // Buscar la ruta actual en estudiantesRoutes
  const currentRoute = estudiantesRoutes.find(route => route.key === routeKey);
  
  if (!currentRoute) {
    // Si no se encuentra la ruta, retornar breadcrumb básico
    return [
      {
        href: '/',
        title: <HomeOutlined />,
      },
      {
        title: (
          <>
            <UserOutlined />
            <span>Estudiantes</span>
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

  // Construir la cadena de padres
  const buildBreadcrumbChain = (key) => {
    const route = estudiantesRoutes.find(r => r.key === key);
    if (!route) return;

    // Si tiene padre, agregarlo primero
    if (route.menu?.parent) {
      buildBreadcrumbChain(route.menu.parent);
    }

    // Agregar la ruta actual (solo si no es la última)
    if (key !== routeKey || currentTitle === null) {
      const isRoot = key === 'EST';
      breadcrumbItems.push({
        href: route.path,
        title: isRoot ? (
          <>
            <UserOutlined />
            <span>{route.menu?.label || 'Estudiantes'}</span>
          </>
        ) : route.menu?.label || route.path,
      });
    }
  };

  // Construir la cadena hasta el padre
  if (currentRoute.menu?.parent) {
    buildBreadcrumbChain(currentRoute.menu.parent);
  } else if (currentRoute.key !== 'EST') {
    // Si no tiene parent pero no es EST, agregar EST
    const rootRoute = estudiantesRoutes.find(r => r.key === 'EST');
    if (rootRoute) {
      breadcrumbItems.push({
        href: rootRoute.path,
        title: (
          <>
            <UserOutlined />
            <span>{rootRoute.menu?.label || 'Estudiantes'}</span>
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

/**
 * Crea breadcrumb para la página de lista de estudiantes
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createListBreadcrumbItems = () => {
  return createBreadcrumbItems('EST');
};

/**
 * Crea breadcrumb para la página de registro/edición de estudiante
 * 
 * @param {string} title - Título de la página (ej: 'Registrar Nuevo Estudiante', 'Editar Estudiante')
 * @returns {Array} Array de items del breadcrumb
 */
export const createRegisterBreadcrumbItems = (title) => {
  return createBreadcrumbItems('EST-REGISTRAR', title);
};

/**
 * Crea breadcrumb para la página de detalle de estudiante
 * 
 * @returns {Array} Array de items del breadcrumb
 */
export const createDetailBreadcrumbItems = () => {
  return [
    { title: 'Inicio', href: '/' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: 'Detalle del Estudiante' },
  ];
};

