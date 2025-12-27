// src/presentation/components/organisms/Sidebar/Sidebar.jsx
import NavigationMenu from '@molecules/Navigationmenu';

/**
 * Sidebar - Componente organismo del Sidebar principal
 * 
 * Single Responsibility: Organismo que compone el Sidebar de la aplicación
 * 
 * Clean Architecture:
 * - Presentation Layer: Organism component
 * - Usa: Molecules (NavigationMenu)
 */
const Sidebar = ({ collapsed, onMenuClick }) => {
    return (
        <div className="sidebar-container">
            <NavigationMenu
                collapsed={collapsed}
                onMenuClick={onMenuClick}
            />
        </div>
    );
};

export default Sidebar;
