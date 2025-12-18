// src/presentation/components/organisms/Header/Header.jsx
import HeaderLeft from '@/presentation/components/molecules/Headerleft';
import HeaderRight from '@/presentation/components/molecules/Headerright';

/**
 * Header - Componente organismo del Header principal
 * Contiene las secciones izquierda y derecha
 */
const Header = ({ collapsed, onToggle }) => {
    return (
        <>
            <HeaderLeft collapsed={collapsed} onToggle={onToggle} />
            <HeaderRight />
        </>
    );
};

export default Header;