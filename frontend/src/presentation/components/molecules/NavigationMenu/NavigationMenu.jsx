// src/presentation/components/molecules/NavigationMenu/NavigationMenu.jsx
import { Menu } from 'antd';
import {
    UserOutlined,
    ProfileOutlined,
    OrderedListOutlined,
    CarryOutFilled,
    SettingOutlined,
} from '@ant-design/icons';

const NavigationMenu = ({
    defaultSelectedKey = '1',
    collapsed = false,
    onMenuClick
}) => {
    const menuItems = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: 'Dashboard',
        },
        {
            key: '2',
            icon: <CarryOutFilled />,
            label: 'My Orders',
        },
        {
            key: '3',
            icon: <OrderedListOutlined />,
            label: 'ToDo',
        },
        {
            key: '4',
            icon: <ProfileOutlined />,
            label: 'Profile',
        },
        {
            key: '5',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    return (
        <Menu
            mode="inline"
            defaultSelectedKeys={[defaultSelectedKey]}
            className="navigation-menu"
            items={menuItems}
            onClick={onMenuClick}
            inlineCollapsed={collapsed}
        />
    );
};

export default NavigationMenu;