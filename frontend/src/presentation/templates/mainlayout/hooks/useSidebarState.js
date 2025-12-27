// src/presentation/templates/mainlayout/hooks/useSidebarState.js
/**
 * Hook para manejar el estado del sidebar
 * 
 * Single Responsibility: Solo maneja el estado collapsed del sidebar
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook de React para manejar estado de UI
 */

import { useState } from 'react';

/**
 * Hook que maneja el estado del sidebar (collapsed/expanded)
 * @returns {Object} - Objeto con estado y función para toggle
 */
export const useSidebarState = (initialCollapsed = false) => {
    const [collapsed, setCollapsed] = useState(initialCollapsed);

    const toggle = () => {
        setCollapsed(prev => !prev);
    };

    const collapse = () => {
        setCollapsed(true);
    };

    const expand = () => {
        setCollapsed(false);
    };

    return {
        collapsed,
        toggle,
        collapse,
        expand,
        setCollapsed,
    };
};

