// src/application/navigation/hooks/useNavigationMenu.jsx
/**
 * Hook personalizado para manejar la lógica del menú de navegación
 * 
 * Single Responsibility: Orquestar la lógica de navegación del menú
 * - Manejo de estado (selectedKeys, openKeys)
 * - Sincronización con router (location → selectedKeys)
 * - Navegación programática (handleMenuClick → navigate)
 * - Lógica de expansión de submenús (handleOpenChange)
 * - Preparación de datos para UI (mapItemsWithIcons)
 * 
 * Dependency Inversion: Depende de abstracciones (services) no de implementaciones concretas
 * Open/Closed: Extensible vía callbacks, cerrado para modificación
 * 
 * Clean Architecture:
 * - Application Layer: Lógica de aplicación de navegación
 * - Depende de: infrastructure/navigation/services (abstracciones)
 * - Depende de: presentation/components/atoms/MenuItem (para preparar datos de UI)
 * 
 * NOTA: El uso de MenuItem (presentation) está justificado porque el hook
 * prepara la estructura de datos para renderizar. Esto es similar a cómo
 * un hook puede retornar JSX estructurado para la UI.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as menuGenerator from '@navigation-services/menuGenerator';
import { getEffectiveRouteFromMenuKey, getMenuKeyFromRoute } from '@navigation-services/routeMapper';
import MenuItem from '@atoms/MenuItem';
import { useAuthContext } from '@application-auth';
import { hasAnyPermiso } from '@navigation/utils/hasAnyPermiso.js';

function itemPermitido(item, hasPermisoFn) {
    const accion = item.accion ?? 'LISTAR';
    if (item.permiso) return hasPermisoFn(item.permiso, accion);
    if (item.permisoAny?.length) return hasAnyPermiso(item.permisoAny, hasPermisoFn, accion);
    return true;
}

function filterMenuByPermiso(items, hasPermisoFn, userRole) {
    if (!items?.length) return [];
    return items
      .map((item) => {
        if (item.children?.length) {
          const children = filterMenuByPermiso(item.children, hasPermisoFn, userRole);
          if (children.length === 0) return null;
          if (!itemPermitido(item, hasPermisoFn)) return null;
          return { ...item, children };
        }
        if (!itemPermitido(item, hasPermisoFn)) return null;
        if (item.menu?.labelByRole?.[userRole]) {
          return { ...item, menu: { ...item.menu, label: item.menu.labelByRole[userRole] } };
        }
        return item;
      })
      .filter(Boolean);
}

/**
 * Hook que maneja toda la lógica del menú de navegación
 * 
 * @param {string} defaultSelectedKey - Key del item seleccionado por defecto
 * @param {function} onMenuClick - Callback opcional que se ejecuta al hacer click
 * @returns {Object} { selectedKeys, openKeys, menuItemsWithIcons, handleMenuClick, handleOpenChange }
 */
export const useNavigationMenu = (defaultSelectedKey = 'DASH', onMenuClick) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasPermiso, isAuthenticated, usuario } = useAuthContext();
    const [selectedKeys, setSelectedKeys] = useState([defaultSelectedKey]);
    const [openKeys, setOpenKeys] = useState([]);
    
    // Ref para detectar si es el mount inicial (refresh de página)
    const isInitialMount = useRef(true);

    const hasPermisoStable = useCallback(
        (codigo, accion) => hasPermiso(codigo, accion),
        [hasPermiso]
    );

    const rawNavigationMenu = useMemo(
        () => menuGenerator.generateNavigationMenu(),
        []
    );

    const navigationMenuItems = useMemo(() => {
        if (!isAuthenticated) return rawNavigationMenu;
        const userRole = usuario?.rol?.codigo;
        return filterMenuByPermiso(rawNavigationMenu, hasPermisoStable, userRole);
    }, [rawNavigationMenu, hasPermisoStable, isAuthenticated, usuario]);

    /**
     * Ant Design Menu solo acepta key, label, icon, children, type, disabled, etc.
     * permiso/permisoAny/accion son metadatos internos y no deben llegar al DOM.
     * `group`: passthrough puro de metadata UI para section-labels del sidebar.
     *   No es prop de AntD Menu; el renderer NavigationMenu (presentation) lo consume.
     *   Solo en ítems raíz (nivel 1); no se propaga a children. Sin efecto en RBAC.
     */
    const sanitizeMenuItemForAntd = (item) => {
        const sanitized = {
            key: item.key,
            label: item.label,
            ...(item.icon != null && { icon: item.icon }),
            ...(item.type != null && { type: item.type }),
            ...(item.disabled != null && { disabled: item.disabled }),
            // group: metadata de sección (ej. 'Principal', 'Gestión') — solo pasthrough
            ...(item.group != null && { group: item.group }),
        };
        if (item.children?.length) {
            sanitized.children = item.children.map(sanitizeMenuItemForAntd);
        }
        return sanitized;
    };

    /**
     * Función recursiva para mapear items y subitems con iconos
     * Prepara la estructura de datos para renderizar en la UI
     * 
     * Single Responsibility: Solo mapea items agregando iconos
     * 
     * @param {Array} items - Items del menú sin iconos
     * @returns {Array} - Items del menú con iconos preparados para renderizar
     */
    const mapItemsWithIcons = (items) => {
        return items.map(item => {
            const mappedItem = {
                ...item,
                icon: <MenuItem iconName={item.key} />,
            };
            
            if (item.children && item.children.length > 0) {
                mappedItem.children = mapItemsWithIcons(item.children);
            }

            return sanitizeMenuItemForAntd(mappedItem);
        });
    };

    /**
     * Expande todos los padres de un item cuando es el mount inicial (refresh de página)
     * 
     * @param {string} menuKey - Key del item seleccionado
     */
    const expandParentKeysOnInitialMount = (menuKey) => {
        if (!isInitialMount.current) return;
        
        const parentKeys = menuGenerator.findParentKeys(navigationMenuItems, menuKey);
        if (parentKeys && parentKeys.length > 0) {
            setOpenKeys(parentKeys);
        }
        
        isInitialMount.current = false;
    };

    /**
     * Maneja el click en el Dashboard (caso especial)
     * 
     * @param {string} clickedKey - Key del item clickeado
     * @param {Object} info - Información del click
     */
    const handleDashboardClick = (clickedKey, info) => {
        setOpenKeys([]);
        const route = getEffectiveRouteFromMenuKey(clickedKey, hasPermisoStable);
        if (route) {
            navigate(route);
        }
        setSelectedKeys([clickedKey]);
        if (onMenuClick) {
            onMenuClick(info);
        }
    };

    /**
     * Toggle de un submenú (abrir/cerrar)
     * 
     * @param {string} clickedKey - Key del item clickeado
     */
    const toggleSubmenu = (clickedKey) => {
        const currentOpenKeys = openKeys.includes(clickedKey)
            ? openKeys.filter(key => key !== clickedKey)
            : [...openKeys, clickedKey];
        setOpenKeys(currentOpenKeys);
    };

    /**
     * Navega a un item del menú y actualiza el estado
     * 
     * @param {string} clickedKey - Key del item clickeado
     * @param {Object} info - Información del click
     */
    const navigateToMenuItem = (clickedKey, info) => {
        const route = getEffectiveRouteFromMenuKey(clickedKey, hasPermisoStable);
        if (route) {
            navigate(route);
        }
        setSelectedKeys([clickedKey]);
        if (onMenuClick) {
            onMenuClick(info);
        }
    };
    
    /**
     * Sincroniza el item seleccionado con la ruta actual
     * Cuando el usuario navega directamente (URL, botón atrás, etc.), actualiza el menú
     * 
     * Comportamiento especial en refresh de página:
     * - Si es el mount inicial (refresh), expande todos los padres del item seleccionado
     * - Esto permite ver la jerarquía completa cuando se refresca con una ruta específica
     */
    const menuSidebarKeyFromState = location.state?.menuSidebarKey;

    useEffect(() => {
        const menuKey = getMenuKeyFromRoute(location.pathname, location.state);

        if (menuKey && menuKey !== selectedKeys[0]) {
            setSelectedKeys([menuKey]);
            expandParentKeysOnInitialMount(menuKey);
        } else if (isInitialMount.current) {
            // Si no hay menuKey pero es el mount inicial, marcar como completado
            isInitialMount.current = false;
        }
        // Si no hay key, no hacer nada - el createAppRouter maneja las redirecciones
    }, [location.pathname, menuSidebarKeyFromState, selectedKeys, navigationMenuItems]);

    /**
     * Maneja el click en un item del menú
     * 
     * Single Responsibility: Orquesta la lógica de click delegando a funciones específicas
     * - Si es Dashboard: cierra todos los módulos y navega
     * - Si tiene children: solo toggle del submenú (no navega)
     * - Si no tiene children: navega a la ruta correspondiente
     * 
     * @param {Object} info - Información del click (contiene key, etc.)
     */
    const handleMenuClick = (info) => {
        const clickedKey = info.key;
        
        // Caso especial: Dashboard - cerrar todos los módulos
        if (clickedKey === 'DASH') {
            handleDashboardClick(clickedKey, info);
            return;
        }
        
        // Verificar si el item tiene children
        const menuItem = menuGenerator.findMenuItemByKey(navigationMenuItems, clickedKey);
        
        // Si tiene children, solo toggle del submenú (no navegar)
        if (menuItem && menuItem.children && menuItem.children.length > 0) {
            toggleSubmenu(clickedKey);
            return;
        }
        
        // Si no tiene children, navegar a la ruta correspondiente
        navigateToMenuItem(clickedKey, info);
    };

    /**
     * Filtra las keys manteniendo solo las del módulo raíz especificado
     * Regla de negocio: Solo un módulo raíz abierto a la vez
     * 
     * @param {Array} keys - Array de keys a filtrar
     * @param {string} rootModuleKey - Key del módulo raíz a mantener
     * @returns {Array} - Keys filtradas
     */
    const filterKeysByRootModule = (keys, rootModuleKey) => {
        return keys.filter(key => {
            const keyRoot = menuGenerator.getRootModuleKey(navigationMenuItems, key);
            return keyRoot === rootModuleKey || key === rootModuleKey;
        });
    };

    /**
     * Maneja el cambio de submenús abiertos
     * 
     * Single Responsibility: Orquesta la lógica de expansión/colapso de submenús
     * Regla de negocio: Solo un módulo raíz abierto a la vez
     * 
     * @param {Array} keys - Array de keys de submenús que deben estar abiertos
     */
    const handleOpenChange = (keys) => {
        // Detectar qué keys se están abriendo (nuevas keys que no estaban en openKeys)
        const newKeys = keys.filter(key => !openKeys.includes(key));
        
        // Si se está abriendo un módulo raíz nuevo
        if (newKeys.length > 0) {
            const openedRootModule = newKeys.find(key => 
                menuGenerator.isRootModule(navigationMenuItems, key)
            );
            
            if (openedRootModule) {
                // Cerrar todos los demás módulos raíz, mantener solo el nuevo
                const filteredKeys = filterKeysByRootModule(keys, openedRootModule);
                setOpenKeys(filteredKeys);
                return;
            }
        }
        
        // Si no se está abriendo un módulo raíz, permitir el cambio normal
        setOpenKeys(keys);
    };

    // Mapear los items del menú con sus iconos (preparar para renderizar)
    const menuItemsWithIcons = mapItemsWithIcons(navigationMenuItems);

    return {
        selectedKeys,
        openKeys,
        menuItemsWithIcons,
        handleMenuClick,
        handleOpenChange,
    };
};

