// src/shared/utils/router/routeMapperService.js
/**
 * Utilidad para mapear keys del menú con rutas del router
 * Single Responsibility: Solo maneja el mapeo entre menú y rutas
 * 
 * Este servicio genera automáticamente el mapeo desde las rutas definidas en los módulos.
 * Cada ruta debe tener una propiedad 'key' que corresponda a una key en navigationMenuData.js
 * 
 * Ejemplo de ruta con key:
 * {
 *   path: '/estudiantes',
 *   element: <EstudiantesListPage />,
 *   key: 'EST-LIST',  // ← Esta key debe existir en navigationMenuData.js
 * }
 * 
 * El mapeo se genera automáticamente, evitando duplicación y manteniendo una única fuente de verdad.
 * Las rutas son la fuente de verdad, y el mapeo se deriva de ellas.
 */

import { getAllRoutes } from '@config/router/routesConfig';

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
            map[route.key] = route.path;
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
    
    // Caso especial: si no se encuentra y es '/', buscar 'DASH' (Dashboard)
    // También manejar '/dashboard' como alias de '/'
    if (normalizedRoute === '/' || normalizedRoute === '/dashboard') {
        return map['DASH'] ? 'DASH' : null;
    }
    
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
