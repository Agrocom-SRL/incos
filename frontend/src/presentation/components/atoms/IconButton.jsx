// src/presentation/components/atoms/IconButton.jsx
import { Button as AntButton } from 'antd';

/**
 * IconButton - Componente atómico para botones con solo icono
 * 
 * @param {React.ReactNode} icon - Icono a mostrar
 * @param {function} onClick - Función que se ejecuta al hacer click
 * @param {string} size - Tamaño: 'small' | 'middle' | 'large'
 * @param {boolean} disabled - Si está deshabilitado
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Button
 */
const IconButton = ({
    icon,
    onClick,
    size = 'middle',
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <AntButton
            type="text"
            size={size}
            icon={icon}
            onClick={onClick}
            disabled={disabled}
            className={`icon-button ${className}`.trim()}
            {...props}
        />
    );
};

export default IconButton;
