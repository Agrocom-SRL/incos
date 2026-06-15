/**
 * HeaderUtilities — molécula compartida de utilidades del header.
 *
 * Zona derecha del header: ThemeToggle + avatar/perfil.
 * Incluye el ThemeToggle global para que el oscurecimiento afecte a toda la app.
 *
 * Sigue el patrón mv2 (MatriculaV2TopBar) pero sin buscador (el shell no lo tiene).
 * Nombre de usuario en excepción §4b (header = ficha de usuario logueado, no colección).
 *
 * @module presentation/components/molecules/HeaderUtilities
 * @level molécula
 */

import { Flex, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { useAuthContext } from '@application-auth';
import ThemeToggle from '@atoms/ThemeToggle';

const { Text } = Typography;

/**
 * @param {{ className?: string }} props
 */
const HeaderUtilities = ({ className = '' }) => {
  const { user, logout } = useAuthContext();
  const { message } = App.useApp();

  const handleLogout = async () => {
    message.success('Sesión cerrada correctamente');
    await logout();
  };

  const menuItems = [
    {
      key: 'user-info',
      label: (
        <div className="header-utilities__dropdown-user">
          <UserOutlined className="header-utilities__dropdown-icon" />
          <Text strong className="header-utilities__dropdown-name">
            {user?.username || 'Usuario'}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <span className="header-utilities__dropdown-logout">
          <LogoutOutlined className="header-utilities__dropdown-logout-icon" />
          Cerrar Sesión
        </span>
      ),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Flex
      align="center"
      gap="small"
      className={`header-utilities${className ? ` ${className}` : ''}`}
    >
      {/* ThemeToggle global — oscurece TODA la app (shell + mv2 + módulos migrados) */}
      <ThemeToggle className="header-utilities__theme-toggle" />

      {/* Avatar / perfil */}
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
        styles={{ root: { minWidth: '220px', padding: '8px 0' } }}
      >
        <button
          type="button"
          className="header-utilities__avatar"
          aria-label="Menú de usuario"
        >
          <UserOutlined />
        </button>
      </Dropdown>
    </Flex>
  );
};

export default HeaderUtilities;
