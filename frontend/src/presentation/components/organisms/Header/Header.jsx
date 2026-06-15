// src/presentation/components/organisms/Header/Header.jsx
/**
 * Header — organismo del header principal (lenguaje visual mv2).
 *
 * Compone HeaderLeft (logo + trigger) + HeaderUtilities (ThemeToggle + avatar).
 * HeaderUtilities integra el ThemeToggle global para que el toggle oscurezca
 * TODO el shell (header, sider, content, menú), no solo matricula-v2.
 *
 * Clean Architecture:
 * - Presentation Layer: Organism component
 * - Usa: Molecules (HeaderLeft, HeaderUtilities)
 */
import { HeaderLeft } from '@molecules';
import HeaderUtilities from '@molecules/HeaderUtilities';

const Header = ({ collapsed, onToggle }) => {
    return (
        <>
            <HeaderLeft collapsed={collapsed} onToggle={onToggle} />
            <HeaderUtilities />
        </>
    );
};

export default Header;
