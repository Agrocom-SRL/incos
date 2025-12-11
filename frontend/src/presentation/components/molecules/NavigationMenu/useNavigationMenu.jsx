// src/presentation/components/molecules/NavigationMenu/useNavigationMenu.jsx
import React, { useState } from 'react';
import { navigationMenuItems } from '@data/navigationMenuData';
import MenuItemIcon from '@atoms/MenuItemIcon';

/**
 * Hook personalizado para manejar la lógica del menú de navegación
 * Al seleccionar un módulo raíz, los demás se cierran automáticamente
 */
export const useNavigationMenu = (defaultSelectedKey = 'DASH', onMenuClick) => {
    const [selectedKeys, setSelectedKeys] = useState([defaultSelectedKey]);
    const [openKeys, setOpenKeys] = useState([]);

    // Obtener todas las keys de módulos raíz
    const getRootModuleKeys = () => {
        return navigationMenuItems.map(item => item.key);
    };

    // Obtener el módulo raíz de una key (recursivo)
    const getRootModuleKey = (items, targetKey) => {
        for (const item of items) {
            if (item.key === targetKey) {
                return item.key; // Es un módulo raíz
            }
            if (item.children) {
                const found = getRootModuleKey(item.children, targetKey);
                if (found) {
                    return item.key; // Retorna el módulo raíz
                }
            }
        }
        return null;
    };

    // Verificar si una key es un módulo raíz
    const isRootModule = (key) => {
        return navigationMenuItems.some(item => item.key === key);
    };

    // Encontrar todos los padres de un item (recursivo)
    const findParentKeys = (items, targetKey, parentKeys = []) => {
        for (const item of items) {
            if (item.key === targetKey) {
                return parentKeys;
            }
            if (item.children) {
                const found = findParentKeys(item.children, targetKey, [...parentKeys, item.key]);
                if (found !== null) {
                    return found;
                }
            }
        }
        return null;
    };

    // Función recursiva para mapear items y subitems con iconos
    const mapItemsWithIcons = (items) => {
        return items.map(item => {
            const mappedItem = {
                ...item,
                // Usar el componente atómico MenuItemIcon con la key del item como iconName
                icon: <MenuItemIcon iconName={item.key} />,
            };
            
            // Si tiene children, procesarlos recursivamente
            if (item.children && item.children.length > 0) {
                mappedItem.children = mapItemsWithIcons(item.children);
            }
            
            return mappedItem;
        });
    };

    // Manejar click en el menú
    const handleMenuClick = (info) => {
        const clickedKey = info.key;
        setSelectedKeys([clickedKey]);
        
        // Encontrar todos los padres del item seleccionado
        const parentKeys = findParentKeys(navigationMenuItems, clickedKey);
        const keysToOpen = parentKeys || [];
        
        // Obtener el módulo raíz del item seleccionado
        const selectedRootModule = getRootModuleKey(navigationMenuItems, clickedKey);
        
        // Filtrar openKeys para mantener solo las keys del módulo que contiene el item seleccionado
        const filteredKeys = openKeys.filter(key => {
            const keyRoot = getRootModuleKey(navigationMenuItems, key);
            return keyRoot === selectedRootModule;
        });
        
        // Combinar:
        // 1. El módulo raíz (si no es el item seleccionado mismo)
        // 2. Los padres del item seleccionado
        // 3. Las keys filtradas del módulo
        const keysToKeep = [];
        if (selectedRootModule && selectedRootModule !== clickedKey) {
            keysToKeep.push(selectedRootModule);
        }
        
        const finalKeys = [...new Set([...keysToKeep, ...filteredKeys, ...keysToOpen])];
        setOpenKeys(finalKeys);
        
        if (onMenuClick) {
            onMenuClick(info);
        }
    };

    // Manejar cambio de submenús abiertos
    const handleOpenChange = (keys) => {
        const currentSelectedKey = selectedKeys[0];
        const selectedRootModule = currentSelectedKey 
            ? getRootModuleKey(navigationMenuItems, currentSelectedKey) 
            : null;
        
        // Si hay un item seleccionado, asegurar que su módulo raíz y padres estén siempre abiertos
        if (selectedRootModule && currentSelectedKey) {
            const parentKeys = findParentKeys(navigationMenuItems, currentSelectedKey) || [];
            
            // Asegurar que el módulo raíz esté en las keys
            const keysWithRootModule = keys.includes(selectedRootModule) 
                ? keys 
                : [...keys, selectedRootModule];
            
            // Detectar qué keys se están abriendo (nuevas keys que no estaban en openKeys)
            const newKeys = keysWithRootModule.filter(key => !openKeys.includes(key));
            
            // Si se está abriendo un módulo raíz nuevo diferente al seleccionado
            if (newKeys.length > 0) {
                const openedRootModule = newKeys.find(key => isRootModule(key));
                
                if (openedRootModule && openedRootModule !== selectedRootModule) {
                    // Cerrar todos los demás módulos raíz, excepto el que tiene el item seleccionado
                    const filteredKeys = keysWithRootModule.filter(key => {
                        const keyRoot = getRootModuleKey(navigationMenuItems, key);
                        return keyRoot === selectedRootModule || keyRoot === openedRootModule || key === selectedRootModule || key === openedRootModule;
                    });
                    
                    // Combinar con los padres del item seleccionado
                    const finalKeys = [...new Set([...filteredKeys, ...parentKeys])];
                    setOpenKeys(finalKeys);
                    return;
                }
            }
            
            // Si se están cerrando keys, verificar que no se cierre el módulo raíz o los padres
            const closingKeys = openKeys.filter(key => !keysWithRootModule.includes(key));
            if (closingKeys.length > 0) {
                // Verificar si se está intentando cerrar el módulo raíz o algún padre
                const isClosingProtectedKeys = closingKeys.some(key => {
                    return key === selectedRootModule || parentKeys.includes(key);
                });
                
                if (isClosingProtectedKeys) {
                    // No permitir cerrar el módulo raíz ni los padres del item seleccionado
                    // Mantener el módulo raíz, los padres y las keys permitidas
                    const allowedKeys = keysWithRootModule.filter(key => {
                        const keyRoot = getRootModuleKey(navigationMenuItems, key);
                        // Permitir keys del módulo seleccionado o que sean padres
                        return keyRoot === selectedRootModule || parentKeys.includes(key) || key === selectedRootModule;
                    });
                    
                    const finalKeys = [...new Set([...allowedKeys, selectedRootModule, ...parentKeys])];
                    setOpenKeys(finalKeys);
                    return;
                }
            }
            
            // Si no se están cerrando keys protegidas, permitir el cambio pero asegurar el módulo raíz y padres
            const finalKeys = [...new Set([...keysWithRootModule, selectedRootModule, ...parentKeys])];
            setOpenKeys(finalKeys);
            return;
        }
        
        // Si no hay item seleccionado, comportamiento normal
        // Detectar qué keys se están abriendo (nuevas keys que no estaban en openKeys)
        const newKeys = keys.filter(key => !openKeys.includes(key));
        
        // Si se está abriendo un módulo raíz nuevo, cerrar los demás módulos raíz
        if (newKeys.length > 0) {
            const openedRootModule = newKeys.find(key => isRootModule(key));
            
            if (openedRootModule) {
                // Cerrar todos los demás módulos raíz
                const filteredKeys = keys.filter(key => {
                    const keyRoot = getRootModuleKey(navigationMenuItems, key);
                    return keyRoot === openedRootModule || key === openedRootModule;
                });
                
                setOpenKeys(filteredKeys);
                return;
            }
        }
        
        // Si no se está abriendo un módulo raíz, permitir el cambio normal
        setOpenKeys(keys);
    };

    // Mapear los items del menú con sus iconos correspondientes
    const menuItemsWithIcons = mapItemsWithIcons(navigationMenuItems);

    return {
        selectedKeys,
        openKeys,
        menuItemsWithIcons,
        handleMenuClick,
        handleOpenChange,
    };
};
