// src/presentation/components/organisms/Sidebar/Sidebar.jsx
/**
 * Sidebar — organismo del sidebar principal.
 *
 * Estructura mv2: logo-area + NavigationMenu (RBAC-aware) + SidebarUserFooter.
 * El menú de navegación NO se toca; solo el envoltorio visual se actualiza
 * al lenguaje mv2 (superficies, border-right, footer de usuario, tokens conmutables).
 *
 * Clean Architecture:
 * - Presentation Layer: Organism component
 * - Usa: Molecules (NavigationMenu, SidebarUserFooter) + atoms (Logo)
 */
import { Flex } from 'antd';
import Logo from '@atoms/Logo';
import NavigationMenu from '@molecules/NavigationMenu';
import SidebarUserFooter from '@molecules/SidebarUserFooter';

const Sidebar = ({ collapsed }) => {
    return (
        <Flex
            vertical
            className={`sidebar-container${collapsed ? ' sidebar-container--collapsed' : ''}`}
        >
            {/* Logo area — estilo mv2 */}
            <div className="sidebar-container__logo">
                {collapsed ? (
                    <div className="sidebar-container__logo-icon" aria-label="INCOS">
                        INCOS
                    </div>
                ) : (
                    <Logo variant="horizontal" size="medium" />
                )}
            </div>

            {/* Menú de navegación RBAC-aware (sin cambios de lógica) */}
            <div className="sidebar-container__nav">
                <NavigationMenu collapsed={collapsed} />
            </div>

            {/* Footer de usuario — molécula compartida mv2 */}
            <SidebarUserFooter collapsed={collapsed} />
        </Flex>
    );
};

export default Sidebar;
