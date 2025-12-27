// src/presentation/components/atoms/Logo.jsx
import { Image } from 'antd';
import logoIcon from '@assets/images/branding/logo-icon.webp';
import logoHorizontal from '@assets/images/branding/logo-horizontal.webp';

/**
 * Logo - Componente atómico del logo de INCOS
 * 
 * @param {string} variant - Variante del logo: 'icon' | 'horizontal'
 * @param {string} size - Tamaño: 'small' | 'medium' | 'large'
 * @param {function} onClick - Función opcional que se ejecuta al hacer click
 */
const Logo = ({
    variant = 'horizontal',
    size = 'medium',
    onClick
}) => {
    const logoSrc = variant === 'horizontal' ? logoHorizontal : logoIcon;

    return (
        <div
            className={`app-logo app-logo--${size} app-logo--${variant}`}
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