// src/presentation/components/atoms/Avatar.jsx
/**
 * Avatar - Componente atómico para avatares
 * 
 * Single Responsibility: Wrapper de Avatar de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Avatar as AntAvatar } from 'antd';

const { Group } = AntAvatar;

const Avatar = ({ className = '', ...props }) => {
    const avatarClassName = className ? `avatar ${className}`.trim() : 'avatar';
    return <AntAvatar className={avatarClassName} {...props} />;
};

Avatar.Group = Group;

export default Avatar;
