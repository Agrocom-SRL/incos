// src/presentation/components/atoms/MenuItem.jsx
import React from 'react';
import { menuIconMap } from '@config/icons';

/**
 * MenuItem - Componente atómico para renderizar iconos del menú
 * 
 * Single Responsibility: Solo renderiza el icono correspondiente al key del menú
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente atómico de UI
 * - Usa: Configuración de iconos desde infrastructure/config/icons
 * 
 * @param {string} iconName - Nombre del icono (key del item del menú)
 * @param {object} props - Props adicionales para el icono
 */
const MenuItem = ({ iconName, ...props }) => {
    const IconComponent = menuIconMap[iconName];

    if (!IconComponent) {
        return null;
    }

    return <IconComponent {...props} />;
};

export default MenuItem;
