// src/presentation/components/atoms/Avatar.jsx
import { Avatar as AntAvatar } from 'antd';
import '@presentation/styles/components/atoms/avatar.css';

const { Group } = AntAvatar;

/**
 * Componente Avatar atómico
 * Wrapper de Ant Design Avatar con estilos del tema INCOS
 * 
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales de Ant Design Avatar
 */
const Avatar = ({ className = '', ...props }) => {
    return <AntAvatar className={`incos-avatar ${className}`} {...props} />;
};

Avatar.Group = Group;

export default Avatar;
