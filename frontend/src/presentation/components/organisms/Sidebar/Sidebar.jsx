// src/presentation/components/organisms/Sidebar/Sidebar.jsx
import { Flex } from 'antd';
import NavigationMenu from '@molecules/NavigationMenu';
import SidebarUserFooter from '@molecules/SidebarUserFooter';

/**
 * Sidebar - Componente organismo del Sidebar principal
 *
 * Single Responsibility: Organismo que compone el Sidebar de la aplicación
 *
 * Clean Architecture:
 * - Presentation Layer: Organism component
 * - Usa: Molecules (NavigationMenu, SidebarUserFooter)
 */
const Sidebar = ({ collapsed }) => {
    return (
        <Flex
            vertical
            className="sidebar-container"
        >
            <div className="sidebar-nav">
                <NavigationMenu
                    collapsed={collapsed}
                />
            </div>
            <SidebarUserFooter collapsed={collapsed} />
        </Flex>
    );
};

export default Sidebar;
