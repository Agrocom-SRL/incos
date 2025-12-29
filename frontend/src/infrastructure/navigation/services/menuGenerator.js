// src/infrastructure/navigation/services/menuGenerator.js
/**
 * Servicio para generar el menú de navegación desde las rutas definidas en los módulos
 * 
 * Single Responsibility: Solo genera la estructura del menú desde las rutas
 * Open/Closed: Extensible agregando metadata a las rutas sin modificar este servicio
 * 
 * Este servicio elimina la necesidad de mantener navigationMenuData.js como fuente de verdad separada.
 * Las rutas ahora son la única fuente de verdad, y el menú se genera automáticamente.
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Servicio técnico que procesa datos de rutas
 * - Depende de: routes/modules (presentation layer)
 */

import { getAllRoutes } from '@routes';

/**
 * Construye la estructura jerárquica del menú desde las rutas
 * @param {Array} routes - Array de rutas con metadata
 * @returns {Array} - Estructura jerárquica del menú
 */
const buildMenuHierarchy = (routes) => {
    // Crear un mapa de items por key para acceso rápido
    const itemsMap = new Map();
    const rootItems = [];

    // Primero, crear todos los items sin children
    routes.forEach(route => {
        if (!route.menu) return; // Si no tiene metadata de menú, ignorar

        const item = {
            key: route.key,
            label: route.menu.label,
            module: route.menu.module,
            // Solo incluir path si tiene elemento (no es solo un grupo padre)
            ...(route.element && { path: route.path }),
            order: route.menu.order || 999, // Orden por defecto
            children: [],
        };

        itemsMap.set(route.key, item);
    });

    // Luego, construir la jerarquía basada en parent
    itemsMap.forEach((item, key) => {
        const route = routes.find(r => r.key === key);
        if (!route || !route.menu) return;

        const parentKey = route.menu.parent;

        if (parentKey && itemsMap.has(parentKey)) {
            // Es un hijo, agregarlo al padre
            const parent = itemsMap.get(parentKey);
            parent.children.push(item);
            // Ordenar hijos por order
            parent.children.sort((a, b) => a.order - b.order);
        } else {
            // Es un item raíz
            rootItems.push(item);
        }
    });

    // Ordenar items raíz por order
    rootItems.sort((a, b) => a.order - b.order);

    // Ordenar recursivamente todos los children y limpiar arrays vacíos
    const sortChildren = (items) => {
        items.forEach(item => {
            if (item.children && item.children.length > 0) {
                item.children.sort((a, b) => a.order - b.order);
                sortChildren(item.children);
            } else {
                // Si no tiene children, eliminar el array vacío para que no se muestre como submenú
                delete item.children;
            }
        });
    };

    sortChildren(rootItems);

    return rootItems;
};

/**
 * Genera el menú de navegación completo desde las rutas
 * @returns {Array} - Estructura completa del menú de navegación
 */
export const generateNavigationMenu = () => {
    const allRoutes = getAllRoutes();
    return buildMenuHierarchy(allRoutes);
};

/**
 * Obtiene un item del menú por su key (búsqueda recursiva)
 * @param {Array} menuItems - Items del menú
 * @param {string} key - Key a buscar
 * @returns {Object|null} - Item encontrado o null
 */
export const findMenuItemByKey = (menuItems, key) => {
    for (const item of menuItems) {
        if (item.key === key) {
            return item;
        }
        if (item.children && item.children.length > 0) {
            const found = findMenuItemByKey(item.children, key);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

/**
 * Obtiene el módulo raíz de un item (recursivo)
 * @param {Array} menuItems - Items del menú
 * @param {string} targetKey - Key del item objetivo
 * @returns {string|null} - Key del módulo raíz o null
 */
export const getRootModuleKey = (menuItems, targetKey) => {
    for (const item of menuItems) {
        if (item.key === targetKey) {
            return item.key; // Es un módulo raíz
        }
        if (item.children && item.children.length > 0) {
            const found = getRootModuleKey(item.children, targetKey);
            if (found) {
                return item.key; // Retorna el módulo raíz
            }
        }
    }
    return null;
};

/**
 * Encuentra todos los padres de un item (recursivo)
 * @param {Array} menuItems - Items del menú
 * @param {string} targetKey - Key del item objetivo
 * @param {Array} parentKeys - Array acumulativo de keys de padres
 * @returns {Array|null} - Array de keys de padres o null
 */
export const findParentKeys = (menuItems, targetKey, parentKeys = []) => {
    for (const item of menuItems) {
        if (item.key === targetKey) {
            return parentKeys;
        }
        if (item.children && item.children.length > 0) {
            const found = findParentKeys(item.children, targetKey, [...parentKeys, item.key]);
            if (found !== null) {
                return found;
            }
        }
    }
    return null;
};

/**
 * Verifica si una key es un módulo raíz
 * @param {Array} menuItems - Items del menú
 * @param {string} key - Key a verificar
 * @returns {boolean} - true si es módulo raíz
 */
export const isRootModule = (menuItems, key) => {
    return menuItems.some(item => item.key === key);
};
