// src/presentation/components/atoms/IconButton.jsx
/**
 * IconButton - Componente atómico para botones con solo icono
 * 
 * Single Responsibility: Wrapper de Button de Ant Design para iconos
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Button as AntButton } from 'antd';

const IconButton = ({
    icon,
    onClick,
    size = 'middle',
    disabled = false,
    className = '',
    ...props
}) => {
    const iconButtonClassName = className ? `icon-button ${className}`.trim() : 'icon-button';

    return (
        <AntButton
            type="text"
            size={size}
            icon={icon}
            onClick={onClick}
            disabled={disabled}
            className={iconButtonClassName}
            {...props}
        />
    );
};

export default IconButton;
