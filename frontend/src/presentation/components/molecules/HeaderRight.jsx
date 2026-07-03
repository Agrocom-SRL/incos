// src/presentation/components/molecules/HeaderRight.jsx
import { App, Flex, Dropdown, Typography, Avatar as AntAvatar } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@atoms';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { useAuthContext } from '@application-auth';
import { buildInitials } from '@application/utils/formatters';
import RolPill from './RolPill';
import './HeaderRight.css';

const { Text } = Typography;

/**
 * HeaderRight — sección derecha del header: menú de usuario.
 * El cuadro de identidad lleva a "Mi perfil" (ya no hay ítem en el sidebar).
 */
const HeaderRight = () => {
    const { user, logout } = useAuthContext();
    const { message } = App.useApp();
    const navigate = useNavigate();

    const nombre = user?.vinculo_perfil?.nombre_completo || user?.username || 'Usuario';
    const correo = user?.email || '—';

    const handleLogout = async () => {
        message.success('Sesión cerrada correctamente');
        await logout();
    };

    const menuItems = [
        {
            key: 'mi-perfil',
            label: (
                <div className="header-user__card" role="link" aria-label="Ir a mi perfil">
                    <AntAvatar size={44} className="header-user__avatar">
                        {buildInitials(nombre)}
                    </AntAvatar>
                    <div className="header-user__meta">
                        <Text className="header-user__name" ellipsis={{ tooltip: nombre }}>
                            {nombre}
                        </Text>
                        <Text className="header-user__email" ellipsis={{ tooltip: correo }}>
                            {correo}
                        </Text>
                        <RolPill rol={user?.rol} />
                    </div>
                </div>
            ),
            onClick: () => navigate('/perfil'),
        },
        { type: 'divider' },
        {
            key: 'logout',
            danger: true,
            label: (
                <span className="header-user__item">
                    <LogoutOutlined /> Cerrar sesión
                </span>
            ),
            onClick: handleLogout,
        },
    ];

    return (
        <Flex align="center" gap={allSpacing.margin}>
            <Dropdown
                menu={{ items: menuItems }}
                placement="bottomRight"
                trigger={['click']}
                classNames={{ root: 'header-user__dropdown' }}
            >
                <Flex
                    align="center"
                    gap={allSpacing.marginXS}
                    className="header-user__trigger"
                    style={{ cursor: 'pointer' }}
                >
                    <Avatar icon={<UserOutlined />} />
                    <span
                        className="header-user__trigger-name"
                        style={{
                            color: allColors.colorText,
                            fontWeight: typography.fontWeightStrong,
                        }}
                    >
                        {nombre}
                    </span>
                    <DownOutlined className="header-user__caret" />
                </Flex>
            </Dropdown>
        </Flex>
    );
};

export default HeaderRight;
