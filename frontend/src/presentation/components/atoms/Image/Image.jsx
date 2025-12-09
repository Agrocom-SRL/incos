// src/presentation/components/atoms/Image/Image.jsx
import { Image as AntImage } from 'antd';
import '@styles/components/atoms/image.css';

/**
 * Componente Image atómico
 * Wrapper de Ant Design Image con estilos del tema INCOS
 * 
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Image
 */
const Image = ({ className = '', ...props }) => {
    return <AntImage className={`incos-image ${className}`} {...props} />;
};

export default Image;
