// src/presentation/components/atoms/IconButton/IconButton.jsx
import { Button as AntButton } from 'antd';

/**
 * IconButton - Componente atómico para botones con solo icono
 * 
 * Usa Button de Ant Design con configuración específica para iconos.
 * Los colores se aplican automáticamente desde componentConfig.Button
 * 
 * @param {React.ReactNode} icon - Icono a mostrar
 * @param {function} onClick - Función que se ejecuta al hacer click
 * @param {string} type - Tipo de botón: 'text' | 'primary' | 'default' | 'dashed' | 'link'
 * @param {string} size - Tamaño: 'small' | 'middle' | 'large'
 * @param {boolean} disabled - Si está deshabilitado
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Button
 */
const IconButton = ({
    icon,
    onClick,
    type = 'text',
    size = 'middle',
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <AntButton
            type={type}
            size={size}
            icon={icon}
            onClick={onClick}
            disabled={disabled}
            className={`icon-button ${className}`}
            {...props}
        />
    );
};

export default IconButton;
