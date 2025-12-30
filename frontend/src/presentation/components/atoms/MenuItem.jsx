// src/presentation/components/atoms/MenuItem.jsx
/**
 * MenuItem - Componente atómico para renderizar iconos del menú
 * 
 * Single Responsibility: Solo renderiza el icono correspondiente al key del menú
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente atómico de UI
 * - Usa: Configuración de iconos desde infrastructure/config/icons
 */

import React from 'react';
import { menuIconMap } from '@config/icons';

const MenuItem = ({ iconName, className = '', ...props }) => {
    const IconComponent = menuIconMap[iconName];

    if (!IconComponent) {
        return null;
    }

    const menuItemClassName = className ? `menu-item ${className}`.trim() : 'menu-item';

    return <IconComponent className={menuItemClassName} {...props} />;
};

export default MenuItem;
