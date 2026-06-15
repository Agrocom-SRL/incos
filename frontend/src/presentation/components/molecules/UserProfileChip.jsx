/**
 * UserProfileChip — molécula del perfil de usuario en el topbar.
 *
 * Muestra nombre (buildFullName §4b, excepción ficha del usuario logueado)
 * + meta "Gestión {año}" + avatar con iniciales.
 * Incluye el dropdown de logout (logout separado de HeaderUtilities por SRP).
 *
 * Replica .matricula-v2-topbar__profile de MatriculaV2TopBar.
 *
 * @module presentation/components/molecules/UserProfileChip
 * @level molécula
 */

import { Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { useAuthContext } from '@application-auth';
import { buildFullName } from '@application/utils';
import { dropdownPopupProps } from '@components/popupProps';

function getInitials(name) {
  const parts = String(name || 'U').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || 'U';
}

/**
 * @param {{ className?: string }} props
 */
const UserProfileChip = ({ className = '' }) => {
  const { user, logout } = useAuthContext();
  const { message } = App.useApp();

  // Ficha del usuario logueado — excepción §4b (no es colección, es perfil propio)
  const displayName =
    user?.nombreCompleto ||
    buildFullName(user?.nombres, user?.apellidoPaterno, user?.apellidoMaterno, '') ||
    user?.username ||
    'Usuario';

  const gestionLabel = user?.gestionActiva?.anio
    ? `Gestión ${user.gestionActiva.anio}`
    : 'Gestión actual';

  const initials = getInitials(displayName);

  const handleLogout = async () => {
    message.success('Sesión cerrada correctamente');
    await logout();
  };

  const menuItems = [
    {
      key: 'user-info',
      label: (
        <div className="app-topbar__profile-dropdown-user">
          <UserOutlined />
          <span>{displayName}</span>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <span className="app-topbar__profile-dropdown-logout">
          <LogoutOutlined />
          Cerrar Sesión
        </span>
      ),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      {...dropdownPopupProps}
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
      styles={{ root: { minWidth: '200px' } }}
    >
      <div
        className={`app-topbar__profile${className ? ` ${className}` : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Menú de usuario"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click();
        }}
      >
        <div className="app-topbar__profile-text">
          <div className="app-topbar__profile-name" title={displayName}>
            {displayName}
          </div>
          <div className="app-topbar__profile-meta">{gestionLabel}</div>
        </div>
        <div className="app-topbar__profile-avatar" aria-hidden>
          {initials}
        </div>
      </div>
    </Dropdown>
  );
};

export default UserProfileChip;
