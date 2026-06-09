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
 *
 * Forma: con circle={true} el borde de las variantes se muestra (botón redondo);
 * cuadrados (por defecto) van sin borde para integrarse mejor en tablas y filas densas.
 */

import { Button as AntButton } from 'antd';

const IconButton = ({
    icon,
    onClick,
    size = 'large',
    disabled = false,
    variant = 'default', // 'default' | 'info' | 'success' | 'warning' | 'error' | 'alternative'
    className = '',
    style = {},
    circle = false,
    ...props
}) => {
    const baseClassName = 'icon-button';
    const shapeClassName = circle ? 'icon-button--circle' : 'icon-button--square';
    const variantClassName = variant !== 'default' ? `icon-button--${variant}` : '';
    const iconButtonClassName = [baseClassName, shapeClassName, variantClassName, className]
        .filter(Boolean)
        .join(' ')
        .trim();

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
