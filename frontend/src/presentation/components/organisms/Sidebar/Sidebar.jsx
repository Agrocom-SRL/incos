// src/presentation/components/organisms/Sidebar/Sidebar.jsx
import { Flex } from 'antd';
import NavigationMenu from '@molecules/NavigationMenu';

/**
 * Sidebar - Componente organismo del Sidebar principal
 * 
 * Single Responsibility: Organismo que compone el Sidebar de la aplicación
 * 
 * Clean Architecture:
 * - Presentation Layer: Organism component
 * - Usa: Molecules (NavigationMenu)
 */
const Sidebar = ({ collapsed }) => {
    return (
        <Flex 
            vertical 
            className="sidebar-container"
        >
            <NavigationMenu
                collapsed={collapsed}
            />
        </Flex>
    );
};

export default Sidebar;
