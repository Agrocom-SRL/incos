// src/presentation/components/molecules/NavigationMenu/useNavigationMenu.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateNavigationMenu, findMenuItemByKey, isRootModule, getRootModuleKey } from '@navigation-services/menuGenerator';
import { getRouteFromMenuKey, getMenuKeyFromRoute } from '@navigation-services/routeMapper';
import MenuItemIcon from '@atoms/MenuItemIcon';

/**
 * Hook personalizado para manejar la lógica del menú de navegación
 * Versión básica - funcionalidades mínimas esenciales
 */
export const useNavigationMenu = (defaultSelectedKey = 'DASH', onMenuClick) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedKeys, setSelectedKeys] = useState([defaultSelectedKey]);
    const [openKeys, setOpenKeys] = useState([]);

    // Generar el menú desde las rutas (memoizado)
    const navigationMenuItems = useMemo(() => generateNavigationMenu(), []);

    // Función recursiva para mapear items y subitems con iconos
    const mapItemsWithIcons = (items) => {
        return items.map(item => {
            const mappedItem = {
                ...item,
                icon: <MenuItemIcon iconName={item.key} />,
            };
            
            if (item.children && item.children.length > 0) {
                mappedItem.children = mapItemsWithIcons(item.children);
            }
            
            return mappedItem;
        });
    };
    
    // Sincronizar el item seleccionado con la ruta actual
    useEffect(() => {
        const currentRoute = location.pathname;
        const menuKey = getMenuKeyFromRoute(currentRoute);
        
        if (menuKey && menuKey !== selectedKeys[0]) {
            setSelectedKeys([menuKey]);
        }
        // Si no hay key, no hacer nada - el createAppRouter maneja las redirecciones
    }, [location.pathname, selectedKeys]);

    // Manejar click en el menú (versión básica)
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
        const menuItem = findMenuItemByKey(navigationMenuItems, clickedKey);
        
        // Si tiene children, solo toggle del submenú
        if (menuItem && menuItem.children && menuItem.children.length > 0) {
            const currentOpenKeys = openKeys.includes(clickedKey)
                ? openKeys.filter(key => key !== clickedKey)
                : [...openKeys, clickedKey];
            setOpenKeys(currentOpenKeys);
            return;
        }
        
        // Si no tiene children, navegar
        const route = getRouteFromMenuKey(clickedKey);
        if (route) {
            navigate(route);
        }
        
        setSelectedKeys([clickedKey]);
        
        if (onMenuClick) {
            onMenuClick(info);
        }
    };

    // Manejar cambio de submenús abiertos
    // Regla: Solo un módulo raíz abierto a la vez
    const handleOpenChange = (keys) => {
        // Detectar qué keys se están abriendo (nuevas keys que no estaban en openKeys)
        const newKeys = keys.filter(key => !openKeys.includes(key));
        
        // Si se está abriendo un módulo raíz nuevo
        if (newKeys.length > 0) {
            const openedRootModule = newKeys.find(key => isRootModule(navigationMenuItems, key));
            
            if (openedRootModule) {
                // Cerrar todos los demás módulos raíz, mantener solo el nuevo
                const filteredKeys = keys.filter(key => {
                    const keyRoot = getRootModuleKey(navigationMenuItems, key);
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

    // Mapear los items del menú con sus iconos
    const menuItemsWithIcons = mapItemsWithIcons(navigationMenuItems);

    return {
        selectedKeys,
        openKeys,
        menuItemsWithIcons,
        handleMenuClick,
        handleOpenChange,
    };
};
