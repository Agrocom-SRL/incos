// src/presentation/components/organisms/Sidebar/Sidebar.jsx
import { Flex, Tooltip } from 'antd';
import Logo from '@atoms/Logo';
import NavigationMenu from '@molecules/NavigationMenu';

const Sidebar = ({ collapsed, onMenuClick, onLogoClick }) => {
    return (
        <div className="sidebar-container">
            {/* Logo cuando está colapsado */}
            <Flex align="center" justify="center">
                <Logo
                    variant="icon"
                    size={collapsed ? "small" : "medium"}
                    onClick={onLogoClick}
                />
            </Flex>

            <NavigationMenu onMenuClick={onMenuClick} />
        </div>
    );
};

export default Sidebar;