// src/infrastructure/navigation/services/routeMapper.js
/**
 * Servicio para mapear keys del menú con rutas del router
 * 
 * Single Responsibility: Solo maneja el mapeo entre menú y rutas
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Servicio técnico que procesa datos de rutas
 * - Depende de: routes/modules (presentation layer)
 * 
 * Este servicio genera automáticamente el mapeo desde las rutas definidas en los módulos.
 * Cada ruta debe tener una propiedad 'key' y metadata 'menu' para generar el menú automáticamente.
 * 
 * Ejemplo de ruta con key y metadata:
 * {
 *   path: '/estudiantes',
 *   element: <EstudiantesListPage />,
 *   key: 'EST-LIST',
 *   menu: {
 *     label: 'Listar',
 *     module: 'EST',
 *     parent: 'EST',
 *     order: 1
 *   }
 * }
 * 
 * El mapeo se genera automáticamente, evitando duplicación y manteniendo una única fuente de verdad.
 * Las rutas son la fuente de verdad, y el mapeo se deriva de ellas.
 */

import { getAllRoutes } from '@routes/modules';

/**
 * Genera el mapeo entre keys del menú y rutas automáticamente
 * desde las rutas definidas en los módulos
 * @returns {Object} - Objeto con el mapeo menuKey -> route
 */
export const generateMenuKeyToRouteMap = () => {
    const allRoutes = getAllRoutes();
    const map = {};
    
    allRoutes.forEach(route => {
        if (route.key && route.path) {
            // Si ya existe una ruta para esta key, priorizar la que tiene metadata de menú
            if (map[route.key] && route.menu) {
                map[route.key] = route.path;
            } else if (!map[route.key]) {
                map[route.key] = route.path;
            }
        }
    });
    
    return map;
};

/**
 * Obtiene el mapeo completo (generado automáticamente)
 * @returns {Object} - Mapeo completo de keys a rutas
 */
export const getMenuKeyToRouteMap = () => {
    return generateMenuKeyToRouteMap();
};

/**
 * Obtiene la ruta correspondiente a una key del menú
 * @param {string} menuKey - La key del item del menú
 * @returns {string|null} - La ruta correspondiente o null si no existe
 */
export const getRouteFromMenuKey = (menuKey) => {
    const map = generateMenuKeyToRouteMap();
    return map[menuKey] || null;
};

/**
 * Obtiene la key del menú correspondiente a una ruta
 * @param {string} route - La ruta actual
 * @returns {string|null} - La key del menú correspondiente o null si no existe
 */
export const getMenuKeyFromRoute = (route) => {
    // Normalizar la ruta (remover trailing slash, excepto para la raíz)
    const normalizedRoute = route === '/' ? '/' : route.replace(/\/$/, '');
    
    // Generar el mapeo y buscar la key correspondiente
    const map = generateMenuKeyToRouteMap();
    
    // Buscar la key que corresponde a esta ruta
    for (const [key, mappedRoute] of Object.entries(map)) {
        if (mappedRoute === normalizedRoute) {
            return key;
        }
    }
    
    // Si no se encuentra, retornar null
    // El createAppRouter maneja las redirecciones (como '/' -> '/dashboard')
    return null;
};

/**
 * Obtiene el mapeo completo como objeto para inspección/debugging
 * Útil para verificar que todas las keys del menú tienen rutas correspondientes
 * @returns {Object} - Mapeo completo con formato { menuKey: route }
 */
export const getFullRouteMap = () => {
    return generateMenuKeyToRouteMap();
};
