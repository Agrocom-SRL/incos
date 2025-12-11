// src/presentation/components/organisms/Sidebar/Sidebar.jsx
import { Flex } from 'antd';
import Logo from '@atoms/Logo';
import NavigationMenu from '@molecules/NavigationMenu';

const Sidebar = ({ collapsed, onMenuClick, onLogoClick }) => {
    return (
        <div className="sidebar-container">
            <Flex align="center" justify="center">
                <Logo
                    variant={collapsed ? "icon" : "horizontal"}
                    size={collapsed ? "small" : "medium"}
                    onClick={onLogoClick}
                />
            </Flex>

            <NavigationMenu
                collapsed={collapsed}
                onMenuClick={onMenuClick}
            />
        </div>
    );
};

export default Sidebar;