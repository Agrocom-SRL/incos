// src/presentation/components/molecules/NavigationMenu/NavigationMenu.jsx
import { Menu } from 'antd';
import { useNavigationMenu } from './usenavigationmenu';

const NavigationMenu = ({
    defaultSelectedKey = 'DASH',
    collapsed = false,
    onMenuClick
}) => {
    const {
        selectedKeys,
        openKeys,
        menuItemsWithIcons,
        handleMenuClick,
        handleOpenChange,
    } = useNavigationMenu(defaultSelectedKey, onMenuClick);

    return (
        <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            className="navigation-menu"
            items={menuItemsWithIcons}
            onClick={handleMenuClick}
            onOpenChange={handleOpenChange}
            inlineCollapsed={collapsed}
        />
    );
};

export default NavigationMenu;