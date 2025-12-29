// src/infrastructure/navigation/services/routeFilter.js
/**
 * Servicio para filtrar rutas
 * 
 * Single Responsibility: Solo filtra rutas según criterios específicos
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Servicio técnico que procesa datos de rutas
 * 
 * Nota: Este servicio mantiene la lógica de filtrado separada del routerFactory
 * para facilitar testing, mantenibilidad y seguir el principio de separación
 * de responsabilidades (routerFactory orquesta, routeFilter implementa).
 */

/**
 * Filtra rutas que tienen elemento (excluye grupos padre sin página)
 * 
 * Utilizado en: routerFactory.jsx para filtrar rutas antes de normalizarlas
 * 
 * @param {Array} routes - Array de rutas
 * @returns {Array} - Array de rutas filtradas (solo las que tienen elemento)
 */
export const filterRoutesWithElements = (routes) => {
    return routes.filter(route => route.element !== null && route.element !== undefined);
};
