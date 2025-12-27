// src/infrastructure/navigation/services/routeFilter.js
/**
 * Servicio para filtrar rutas
 * 
 * Single Responsibility: Solo filtra rutas según criterios específicos
 * Open/Closed: Extensible agregando nuevos filtros sin modificar funciones existentes
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Servicio técnico que procesa datos de rutas
 */

/**
 * Filtra rutas que tienen elemento (excluye grupos padre sin página)
 * @param {Array} routes - Array de rutas
 * @returns {Array} - Array de rutas filtradas
 */
export const filterRoutesWithElements = (routes) => {
    return routes.filter(route => route.element !== null && route.element !== undefined);
};

/**
 * Filtra rutas que tienen metadata de menú
 * @param {Array} routes - Array de rutas
 * @returns {Array} - Array de rutas con metadata de menú
 */
export const filterRoutesWithMenu = (routes) => {
    return routes.filter(route => route.menu !== null && route.menu !== undefined);
};

/**
 * Filtra rutas públicas (sin autenticación requerida)
 * @param {Array} routes - Array de rutas
 * @returns {Array} - Array de rutas públicas
 */
export const filterPublicRoutes = (routes) => {
    return routes.filter(route => route.public === true);
};

/**
 * Filtra rutas protegidas (requieren autenticación)
 * @param {Array} routes - Array de rutas
 * @returns {Array} - Array de rutas protegidas
 */
export const filterProtectedRoutes = (routes) => {
    return routes.filter(route => route.public !== true);
};

