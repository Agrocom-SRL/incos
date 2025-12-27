// src/infrastructure/navigation/services/routeNormalizer.js
/**
 * Servicio para normalizar rutas
 * 
 * Single Responsibility: Solo normaliza paths de rutas para react-router
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Servicio técnico que adapta paths para react-router-dom
 */

/**
 * Normaliza el path de una ruta para react-router
 * @param {string} path - El path original de la ruta
 * @returns {string} - El path normalizado
 */
export const normalizeRoutePath = (path) => {
    // Si es la ruta raíz, usar 'index' para react-router
    if (path === '/') {
        return 'index';
    }
    
    // Remover el "/" inicial si existe
    if (path.startsWith('/')) {
        return path.substring(1);
    }
    
    return path;
};

/**
 * Normaliza múltiples rutas
 * @param {Array} routes - Array de objetos de ruta
 * @returns {Array} - Array de rutas normalizadas
 */
export const normalizeRoutes = (routes) => {
    return routes.map(route => ({
        ...route,
        path: normalizeRoutePath(route.path),
    }));
};
