// src/presentation/components/atoms/Logo/Logo.jsx
import { Image } from 'antd';
import { useState } from 'react';
import logoIcon from '@assets/images/branding/logo-icon.webp';
import logoHorizontal from '@assets/images/branding/logo-horizontal.webp';

const Logo = ({
    variant = 'icon',
    size = 'medium',
    onClick
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const logoSrc = variant === 'horizontal' ? logoHorizontal : logoIcon;

    const handleClick = () => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        onClick?.();
    };

    return (
        <div
            className={`app-logo app-logo--${size} app-logo--${variant} ${isAnimating ? 'app-logo--animating' : ''}`}
            onClick={handleClick}
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