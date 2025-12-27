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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as menuGenerator from '@navigation-services/menuGenerator';
import { getRouteFromMenuKey, getMenuKeyFromRoute } from '@navigation-services/routeMapper';
import MenuItem from '@atoms/MenuItem';

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
    const [selectedKeys, setSelectedKeys] = useState([defaultSelectedKey]);
    const [openKeys, setOpenKeys] = useState([]);

    // Generar el menú desde las rutas (memoizado para evitar regeneraciones innecesarias)
    const navigationMenuItems = useMemo(() => menuGenerator.generateNavigationMenu(), []);

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
            
            return mappedItem;
        });
    };
    
    /**
     * Sincroniza el item seleccionado con la ruta actual
     * Cuando el usuario navega directamente (URL, botón atrás, etc.), actualiza el menú
     */
    useEffect(() => {
        const currentRoute = location.pathname;
        const menuKey = getMenuKeyFromRoute(currentRoute);
        
        if (menuKey && menuKey !== selectedKeys[0]) {
            setSelectedKeys([menuKey]);
        }
        // Si no hay key, no hacer nada - el createAppRouter maneja las redirecciones
    }, [location.pathname, selectedKeys]);

    /**
     * Maneja el click en un item del menú
     * 
     * Single Responsibility: Solo maneja la lógica de click en el menú
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
            setOpenKeys([]);
            const route = getRouteFromMenuKey(clickedKey);
            if (route) {
                navigate(route);
            }
            setSelectedKeys([clickedKey]);
            if (onMenuClick) {
                onMenuClick(info);
            }
            return;
        }
        
        // Verificar si el item tiene children
        const menuItem = menuGenerator.findMenuItemByKey(navigationMenuItems, clickedKey);
        
        // Si tiene children, solo toggle del submenú (no navegar)
        if (menuItem && menuItem.children && menuItem.children.length > 0) {
            const currentOpenKeys = openKeys.includes(clickedKey)
                ? openKeys.filter(key => key !== clickedKey)
                : [...openKeys, clickedKey];
            setOpenKeys(currentOpenKeys);
            return;
        }
        
        // Si no tiene children, navegar a la ruta correspondiente
        const route = getRouteFromMenuKey(clickedKey);
        if (route) {
            navigate(route);
        }
        
        setSelectedKeys([clickedKey]);
        
        if (onMenuClick) {
            onMenuClick(info);
        }
    };

    /**
     * Maneja el cambio de submenús abiertos
     * 
     * Single Responsibility: Solo maneja la lógica de expansión/colapso de submenús
     * Regla de negocio: Solo un módulo raíz abierto a la vez
     * 
     * @param {Array} keys - Array de keys de submenús que deben estar abiertos
     */
    const handleOpenChange = (keys) => {
        // Detectar qué keys se están abriendo (nuevas keys que no estaban en openKeys)
        const newKeys = keys.filter(key => !openKeys.includes(key));
        
        // Si se está abriendo un módulo raíz nuevo
        if (newKeys.length > 0) {
            const openedRootModule = newKeys.find(key => menuGenerator.isRootModule(navigationMenuItems, key));
            
            if (openedRootModule) {
                // Cerrar todos los demás módulos raíz, mantener solo el nuevo
                // Regla de negocio: Solo un módulo raíz abierto a la vez
                const filteredKeys = keys.filter(key => {
                    const keyRoot = menuGenerator.getRootModuleKey(navigationMenuItems, key);
                    // Mantener solo keys del nuevo módulo raíz
                    return keyRoot === openedRootModule || key === openedRootModule;
                });
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

