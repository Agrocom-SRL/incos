// src/presentation/components/atoms/IconButton.jsx
/**
 * IconButton - Componente atómico para botones con solo icono
 * 
 * Single Responsibility: Wrapper de Button de Ant Design para iconos
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Soporta variantes semánticas de color mediante el prop 'variant'
 */

import { Button as AntButton } from 'antd';

const IconButton = ({
    icon,
    onClick,
    size = 'large',
    disabled = false,
    variant = 'default', // 'default' | 'info' | 'success' | 'warning' | 'error'
    className = '',
    style = {},
    circle = false,
    ...props
}) => {
    const baseClassName = 'icon-button';
    const variantClassName = variant !== 'default' ? `icon-button--${variant}` : '';
    const iconButtonClassName = className
        ? `${baseClassName} ${variantClassName} ${className}`.trim()
        : `${baseClassName} ${variantClassName}`.trim();

    return (
        <AntButton
            type="text"
            size={size}
            icon={icon}
            shape={circle ? 'circle' : 'square'}
            onClick={onClick}
            disabled={disabled}
            className={iconButtonClassName}
            style={style}
            {...props}
        />
    );
};

export default IconButton;
