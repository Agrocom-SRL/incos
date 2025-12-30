// src/presentation/components/atoms/Logo.jsx
/**
 * Logo - Componente atómico del logo de INCOS
 * 
 * Single Responsibility: Renderizar el logo del instituto
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Image } from 'antd';
import logoIcon from '@assets/images/branding/logo-icon.webp';
import logoHorizontal from '@assets/images/branding/logo-horizontal.webp';

const Logo = ({
    variant = 'horizontal',
    size = 'medium',
    onClick,
    className = ''
}) => {
    const logoSrc = variant === 'horizontal' ? logoHorizontal : logoIcon;
    const logoClassName = className ? `logo logo--${size} logo--${variant} ${className}`.trim() : `logo logo--${size} logo--${variant}`;

    return (
        <div
            className={logoClassName}
            onClick={onClick}
        >
            <Image
                src={logoSrc}
                alt="INCOS Santa Cruz"
                preview={false}
            />
        </div>
    );
};

export default Logo;