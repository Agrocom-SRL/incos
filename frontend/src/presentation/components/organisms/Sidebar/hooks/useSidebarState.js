// src/presentation/components/organisms/Sidebar/hooks/useSidebarState.js
/**
 * Hook para manejar el estado del sidebar
 *
 * Single Responsibility: Solo maneja el estado collapsed del sidebar
 *
 * Clean Architecture:
 * - Presentation Layer: Hook de React para manejar estado de UI del Sidebar
 * - Pertenece al organismo Sidebar
 *
 * Persiste el estado en localStorage para mantener open/close al refrescar.
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'incos-sidebar-collapsed';

/**
 * Lee el valor persistido del sidebar (true = cerrado, false = abierto).
 * @param {boolean} initialCollapsed - Valor por defecto si no hay dato guardado
 * @returns {boolean}
 */
const getStoredCollapsed = (initialCollapsed) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === null) return initialCollapsed;
        return stored === 'true';
    } catch {
        return initialCollapsed;
    }
};

/**
 * Hook que maneja el estado del sidebar (collapsed/expanded).
 * Persiste en localStorage para mantener el estado al refrescar.
 * @param {boolean} [initialCollapsed=false] - Valor inicial si no hay dato en localStorage
 * @returns {Object} - Objeto con estado y funciones para toggle/collapse/expand
 */
export const useSidebarState = (initialCollapsed = false) => {
    const [collapsed, setCollapsed] = useState(() =>
        getStoredCollapsed(initialCollapsed)
    );

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(collapsed));
        } catch {
            // Ignorar si localStorage no está disponible (privado, etc.)
        }
    }, [collapsed]);

    const toggle = () => {
        setCollapsed((prev) => !prev);
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
