// src/presentation/components/molecules/NavigationMenu/useNavigationMenu.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateNavigationMenu, findMenuItemByKey } from '@router-utils/menuGeneratorService';
import { getRouteFromMenuKey, getMenuKeyFromRoute } from '@router-utils/routeMapperService';
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
        // Si no hay key, no hacer nada - el routerService maneja las redirecciones
    }, [location.pathname, selectedKeys]);

    // Manejar click en el menú (versión básica)
    const handleMenuClick = (info) => {
        const clickedKey = info.key;
        
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

    // Manejar cambio de submenús abiertos (versión básica - sin restricciones)
    const handleOpenChange = (keys) => {
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
