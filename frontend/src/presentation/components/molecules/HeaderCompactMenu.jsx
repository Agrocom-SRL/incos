/**
 * HeaderCompactMenu — molécula de utilities compactas del topbar (< 900px).
 *
 * Colapsa los botones Ayuda/Idioma/Notificaciones/ThemeToggle en un
 * Dropdown con MoreOutlined. Réplica del bloque compacto de MatriculaV2TopBar.
 *
 * @module presentation/components/molecules/HeaderCompactMenu
 * @level molécula
 */

import { Badge, Button, Dropdown } from 'antd';
import {
  BellOutlined,
  GlobalOutlined,
  MoreOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useTheme } from '@presentation/hooks/useTheme';
import { dropdownPopupProps } from '@components/popupProps';

/**
 * @param {{ className?: string }} props
 */
const HeaderCompactMenu = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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
    <Dropdown
      {...dropdownPopupProps}
      menu={utilityMenu}
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<MoreOutlined />}
        className={`app-topbar__more${className ? ` ${className}` : ''}`}
        aria-label="Más opciones"
      />
    </Dropdown>
  );
};

export default HeaderCompactMenu;
