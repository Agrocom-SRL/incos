/**
 * TopBar del layout Matrícula v2.
 * @param {{ onMenuClick: () => void }} props
 */
import {
  BellOutlined,
  GlobalOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Badge, Button, Input, Space } from 'antd';
import { useAuthContext } from '@application-auth';
import ThemeToggle from './ThemeToggle';

function getInitials(name) {
  const parts = String(name || 'U').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || 'U';
}

const MatriculaV2TopBar = ({ onMenuClick }) => {
  const { user } = useAuthContext();
  const displayName =
    user?.nombreCompleto ||
    [user?.nombres, user?.apellidos].filter(Boolean).join(' ') ||
    user?.username ||
    'Usuario';
  const gestionLabel = user?.gestionActiva?.anio
    ? `Gestión ${user.gestionActiva.anio}`
    : 'Gestión actual';
  const initials = getInitials(displayName);

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
        size="large"
        className="matricula-v2-topbar__search"
        allowClear
      />
      <div className="matricula-v2-topbar__spacer" />
      <Space size={4}>
        <Button type="text" icon={<QuestionCircleOutlined />} className="matricula-v2-topbar__icon" />
        <Button type="text" icon={<GlobalOutlined />} className="matricula-v2-topbar__icon" />
        <Badge count={3} size="small" offset={[-2, 2]}>
          <Button type="text" icon={<BellOutlined />} className="matricula-v2-topbar__icon" />
        </Badge>
        <ThemeToggle />
        <span className="matricula-v2-topbar__divider" />
        <div className="matricula-v2-topbar__profile">
          <div className="matricula-v2-topbar__profile-text">
            <div className="matricula-v2-topbar__profile-name">{displayName}</div>
            <div className="matricula-v2-topbar__profile-meta">{gestionLabel}</div>
          </div>
          <div className="matricula-v2-topbar__profile-avatar">{initials}</div>
        </div>
      </Space>
    </header>
  );
};

export default MatriculaV2TopBar;
