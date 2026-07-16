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
import logoHorizontal from '@assets/images/branding/logo-horizontal.webp';

// Escudo institucional servido desde public/ (mismo asset que el favicon)
const logoIcon = '/incos/inco-512.png';

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
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick(event);
                }
            } : undefined}
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