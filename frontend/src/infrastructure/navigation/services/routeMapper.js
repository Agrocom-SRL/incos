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

import { matchPath } from 'react-router-dom';
import { getAllRoutes } from '@routes';
import { resolveEffectiveMenuPath } from '../utils/resolveModuleLanding.js';

/** Resaltar "Lista de Aportes" en rutas /pagos/* compartidas con el flujo de matrícula (vía location.state). */
export const MENU_SIDEBAR_KEY_MAT_APORTES = 'MAT-APO-LISTA';

const PAGOS_ROUTES_WITH_MENU_OVERRIDE = new Set(['PAG-REGISTRAR', 'PAG-DETALLE', 'PAG-EDITAR']);

/**
 * Rutas que coinciden con el pathname (fin de URL), elegida la más específica.
 * @param {string} pathname - pathname normalizado (sin barra final salvo raíz)
 * @returns {Object|null} - Objeto ruta del registry o null
 */
export const findBestMatchingRoute = (pathname) => {
    const allRoutes = getAllRoutes();
    const matches = [];

    for (const route of allRoutes) {
        if (!route.path) continue;
        const m = matchPath({ path: route.path, end: true }, pathname);
        if (m) matches.push(route);
    }

    if (matches.length === 0) return null;

    const segmentWeight = (path) => path.split('/').filter(Boolean).length;
    matches.sort((a, b) => {
        const w = segmentWeight(b.path) - segmentWeight(a.path);
        if (w !== 0) return w;
        return b.path.length - a.path.length;
    });

    return matches[0];
};

/**
 * Key de menú para selección en sidebar: ruta con menú, o cadena breadcrumbParent.
 */
const resolveMenuSelectionKey = (route, navigationState = undefined) => {
    if (!route) return null;

    if (
        PAGOS_ROUTES_WITH_MENU_OVERRIDE.has(route.key) &&
        navigationState?.menuSidebarKey === MENU_SIDEBAR_KEY_MAT_APORTES
    ) {
        return MENU_SIDEBAR_KEY_MAT_APORTES;
    }

    if (route.menu) {
        return route.key;
    }

    const allRoutes = getAllRoutes();
    const visited = new Set();
    let parentKey = route.breadcrumbParent;

    while (parentKey && !visited.has(parentKey)) {
        visited.add(parentKey);
        const parent = allRoutes.find((r) => r.key === parentKey);
        if (!parent) break;
        if (parent.menu) return parent.key;
        parentKey = parent.breadcrumbParent;
    }

    return null;
};

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
 * Obtiene la ruta correspondiente a una key del menú
 * @param {string} menuKey - La key del item del menú
 * @returns {string|null} - La ruta correspondiente o null si no existe
 */
export const getRouteFromMenuKey = (menuKey) => {
    const map = generateMenuKeyToRouteMap();
    return map[menuKey] || null;
};

/**
 * Ruta efectiva al navegar desde el sidebar: aplica menu.landingStack si existe.
 *
 * @param {string} menuKey
 * @param {(codigo: string, accion: string) => boolean} hasPermiso
 * @returns {string|null}
 */
export const getEffectiveRouteFromMenuKey = (menuKey, hasPermiso) => {
    const allRoutes = getAllRoutes();
    const route = allRoutes.find((r) => r.key === menuKey);
    const entryPath = route?.path ?? getRouteFromMenuKey(menuKey);
    if (!entryPath) return null;

    return resolveEffectiveMenuPath(entryPath, route?.menu?.landingStack, hasPermiso);
};

/**
 * Obtiene la key del ítem de menú a resaltar para el pathname actual.
 * Usa coincidencia de patrón (incl. :id) y, si la ruta no tiene menú, sube por breadcrumbParent.
 *
 * @param {string} pathname - pathname de la URL (ej. location.pathname)
 * @param {Object} [navigationState] - location.state (opcional; menuSidebarKey para aportes bajo Matrícula)
 * @returns {string|null} - Key del menú o null
 */
export const getMenuKeyFromRoute = (pathname, navigationState) => {
    const normalizedRoute = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

    const map = generateMenuKeyToRouteMap();
    for (const [key, mappedRoute] of Object.entries(map)) {
        if (mappedRoute === normalizedRoute) {
            const routeObj = getAllRoutes().find((r) => r.key === key);
            if (routeObj) {
                return resolveMenuSelectionKey(routeObj, navigationState);
            }
            return key;
        }
    }

    const matched = findBestMatchingRoute(normalizedRoute);
    if (!matched) {
        return null;
    }

    return resolveMenuSelectionKey(matched, navigationState);
};
