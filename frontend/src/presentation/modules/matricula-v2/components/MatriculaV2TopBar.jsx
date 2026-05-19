/**
 * TopBar del layout Matrícula v2.
 * @param {{ onMenuClick: () => void }} props
 */
import {
  BellOutlined,
  GlobalOutlined,
  MenuOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Badge, Button, Dropdown, Input } from 'antd';
import { useAuthContext } from '@application-auth';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';
import { mv2DropdownPopupProps } from '../theme/popupClass';
import ThemeToggle from './ThemeToggle';

function getInitials(name) {
  const parts = String(name || 'U').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || 'U';
}

const MatriculaV2TopBar = ({ onMenuClick }) => {
  const { user } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const displayName =
    user?.nombreCompleto ||
    [user?.nombres, user?.apellidos].filter(Boolean).join(' ') ||
    user?.username ||
    'Usuario';
  const gestionLabel = user?.gestionActiva?.anio
    ? `Gestión ${user.gestionActiva.anio}`
    : 'Gestión actual';
  const initials = getInitials(displayName);
  const isDark = theme === 'dark';
  const compactUtilities = useMediaQuery('(max-width: 900px)');

  const utilityMenu = {
    items: [
      {
        key: 'help',
        icon: <QuestionCircleOutlined style={{ color: 'var(--info)' }} />,
        label: 'Ayuda',
      },
      {
        key: 'lang',
        icon: <GlobalOutlined style={{ color: 'var(--info)' }} />,
        label: 'Idioma',
      },
      {
        key: 'notifications',
        icon: <BellOutlined style={{ color: 'var(--info)' }} />,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Notificaciones
            <Badge count={3} size="small" />
          </span>
        ),
      },
      { type: 'divider' },
      {
        key: 'theme',
        label: isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
        onClick: ({ domEvent }) => {
          domEvent?.stopPropagation();
          toggleTheme();
        },
      },
    ],
  };

  return (
    <header className="matricula-v2-topbar">
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onMenuClick}
        className="matricula-v2-topbar__menu"
        aria-label="Alternar menú"
      />
      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-soft)' }} />}
        placeholder="Buscar estudiantes, códigos, carreras..."
        className="matricula-v2-topbar__search"
        allowClear
      />
      <div className="matricula-v2-topbar__spacer" />
      <div className="matricula-v2-topbar__end">
        <div className="matricula-v2-topbar__profile">
          <div className="matricula-v2-topbar__profile-text">
            <div className="matricula-v2-topbar__profile-name" title={displayName}>
              {displayName}
            </div>
            <div className="matricula-v2-topbar__profile-meta">{gestionLabel}</div>
          </div>
          <div className="matricula-v2-topbar__profile-avatar" aria-hidden>
            {initials}
          </div>
        </div>

        {compactUtilities ? (
          <Dropdown {...mv2DropdownPopupProps} menu={utilityMenu} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="matricula-v2-topbar__more"
              aria-label="Más opciones"
            />
          </Dropdown>
        ) : (
          <div className="matricula-v2-topbar__utilities">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="matricula-v2-topbar__icon"
              aria-label="Ayuda"
            />
            <Button
              type="text"
              icon={<GlobalOutlined />}
              className="matricula-v2-topbar__icon"
              aria-label="Idioma"
            />
            <Badge count={3} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                icon={<BellOutlined />}
                className="matricula-v2-topbar__icon"
                aria-label="Notificaciones"
              />
            </Badge>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
};

export default MatriculaV2TopBar;
