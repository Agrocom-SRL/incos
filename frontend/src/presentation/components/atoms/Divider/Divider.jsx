// src/presentation/components/atoms/Divider/Divider.jsx
import { Divider as AntDivider } from 'antd';
import '@styles/components/atoms/divider.css';

/**
 * Componente Divider atómico
 * Wrapper de Ant Design Divider con estilos del tema INCOS
 * 
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Divider
 */
const Divider = ({ className = '', ...props }) => {
    return <AntDivider className={`incos-divider ${className}`} {...props} />;
};

export default Divider;
