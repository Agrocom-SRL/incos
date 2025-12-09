// src/presentation/components/atoms/Button/Button.jsx
import { Button as AntButton } from 'antd';
import '@styles/components/atoms/button.css';

/**
 * Componente Button atómico
 * Wrapper de Ant Design Button con estilos del tema INCOS
 * 
 * @param {React.ReactNode} children - Contenido del botón
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Button
 */
const Button = ({ children, className = '', ...props }) => {
    return (
        <AntButton className={`incos-button ${className}`} {...props}>
            {children}
        </AntButton>
    );
};

export default Button;
