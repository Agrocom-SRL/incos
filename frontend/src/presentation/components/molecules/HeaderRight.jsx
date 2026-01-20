// src/presentation/components/molecules/HeaderRight.jsx
import { Flex, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useAuthContext } from '@application-auth';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';

const { Text } = Typography;

/**
 * HeaderRight - Componente molecular para la sección derecha del Header
 * Contiene elementos como Avatar, notificaciones, etc.
 */
const HeaderRight = () => {
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();
    const { message } = App.useApp();

    // Handler para logout
    const handleLogout = () => {
        logout();
        message.success('Sesión cerrada correctamente');
        navigate('/login');
    };

    // Items del menú dropdown
    const menuItems = [
        {
            key: 'user-info',
            label: (
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserOutlined style={{ fontSize: '18px' }} />
                    <Text strong style={{ fontSize: '14px' }}>
                        {user?.username || 'Usuario'}
                    </Text>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: (
                <span style={{ padding: '12px 20px', display: 'inline-block' }}>
                    <LogoutOutlined style={{ marginRight: 8 }} />
                    Cerrar Sesión
                </span>
            ),
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Flex align="center" gap={allSpacing.margin}>
            <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                trigger={['click']}
                styles={{ root: { minWidth: '220px', padding: '8px 0' } }}
            >
                <Avatar 
                    icon={<UserOutlined />} 
                    style={{ cursor: 'pointer' }}
                />
            </Dropdown>
        </Flex>
    );
};

export default HeaderRight;
