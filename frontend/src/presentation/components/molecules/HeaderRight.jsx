// src/presentation/components/molecules/HeaderRight.jsx
import { App, Flex, Dropdown, Typography, Avatar as AntAvatar } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Avatar, StatusPill } from '@atoms';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { useAuthContext } from '@application-auth';
import { rolPillClass } from '@modules/seguridad/roles/components/atoms/rolColor.js';
import '@modules/seguridad/roles/styles/roles.css';
import './HeaderRight.css';

const { Text } = Typography;

/** Iniciales (máx. 2) a partir del nombre o username. */
const iniciales = (texto) => {
  const limpio = String(texto || '').trim();
  if (!limpio) return '—';
  const partes = limpio.split(/\s+/).filter(Boolean);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

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
    const rol = user?.rol?.nombre || null;
    // Pill de rol con el mismo color por categoría que el módulo de Seguridad.
    const pillClass = rolPillClass(user?.rol?.tipo, Boolean(user?.rol?.is_system));

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
                        {iniciales(nombre)}
                    </AntAvatar>
                    <div className="header-user__meta">
                        <Text className="header-user__name" ellipsis={{ tooltip: nombre }}>
                            {nombre}
                        </Text>
                        <Text className="header-user__email" ellipsis={{ tooltip: correo }}>
                            {correo}
                        </Text>
                        {rol ? <StatusPill label={rol} className={pillClass} /> : null}
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
