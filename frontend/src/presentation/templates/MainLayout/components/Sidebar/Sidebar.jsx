// src/presentation/components/organisms/Sidebar/Sidebar.jsx
import NavigationMenu from '@molecules/navigationmenu';

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