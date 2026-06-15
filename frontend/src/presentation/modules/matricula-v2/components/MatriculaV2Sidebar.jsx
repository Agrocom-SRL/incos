/**
 * Sidebar del layout Matrícula v2 (252px expandido por defecto).
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BankOutlined,
  BarChartOutlined,
  DashboardOutlined,
  DollarOutlined,
  IdcardOutlined,
  ReadOutlined,
  RightOutlined,
  SafetyOutlined,
  SettingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useAuthContext } from '@application-auth';
import logoHorizontal from '@assets/images/branding/logo-horizontal.webp';

function getInitials(name) {
  const parts = String(name || 'U').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || 'U';
}

function SidebarItem({ icon, label, active, sub, onClick, collapsed }) {
  const itemClass = [
    'matricula-v2-sidebar__item',
    active ? 'matricula-v2-sidebar__item--active' : '',
    sub ? 'matricula-v2-sidebar__item--sub' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={itemClass}
      style={{
        padding: collapsed ? '10px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        paddingLeft: sub && !collapsed ? 44 : collapsed ? 0 : 14,
      }}
    >
      {active ? <span className="matricula-v2-sidebar__item-bar" aria-hidden /> : null}
      <span className="matricula-v2-sidebar__item-icon">{icon}</span>
      {!collapsed ? <span style={{ flex: 1 }}>{label}</span> : null}
    </button>
  );
}

function SidebarSection({ icon, label, children, defaultOpen, collapsed }) {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = open && !collapsed;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        className="matricula-v2-sidebar__item"
        style={{
          padding: collapsed ? '10px 0' : '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <span className="matricula-v2-sidebar__item-icon">{icon}</span>
        {!collapsed ? (
          <>
            <span style={{ flex: 1 }}>{label}</span>
            <span
              className={`matricula-v2-sidebar__chevron${
                open ? ' matricula-v2-sidebar__chevron--open' : ''
              }`}
              aria-hidden
            >
              <RightOutlined />
            </span>
          </>
        ) : null}
      </button>
      {!collapsed ? (
        <div
          className={`matricula-v2-sidebar__submenu${
            expanded ? ' matricula-v2-sidebar__submenu--open' : ''
          }`}
        >
          <div className="matricula-v2-sidebar__submenu-inner">{children}</div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * @param {{ collapsed?: boolean, isMobile?: boolean, mobileOpen?: boolean, onNavigate?: () => void }} props
 */
const MatriculaV2Sidebar = ({
  collapsed = false,
  isMobile = false,
  mobileOpen = false,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const userName =
    user?.nombreCompleto ||
    [user?.nombres, user?.apellidos].filter(Boolean).join(' ') ||
    user?.username ||
    'Usuario';
  const userRole = user?.rol?.nombre || user?.rolNombre || 'Usuario';
  const userInitials = getInitials(userName);
  const width = isMobile ? 260 : collapsed ? 76 : 252;
  const isMatriculas =
    location.pathname === '/matricula/listar-v2' || location.pathname === '/matricula/listar';

  const nav = (path) => () => {
    navigate(path);
    onNavigate?.();
  };

  const sidebarClass = [
    'matricula-v2-sidebar',
    isMobile ? 'matricula-v2-sidebar--mobile' : '',
    isMobile && mobileOpen ? 'matricula-v2-sidebar--mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside
      className={sidebarClass}
      style={{ width }}
      aria-label="Navegación principal"
      aria-hidden={isMobile && !mobileOpen}
    >
      <div className="matricula-v2-sidebar__logo">
        {collapsed ? (
          <div className="matricula-v2-sidebar__logo-icon">INCOS</div>
        ) : (
          <img src={logoHorizontal} alt="INCOS Santa Cruz" className="matricula-v2-sidebar__logo-img" />
        )}
      </div>

      <nav className="matricula-v2-sidebar__nav">
        {!collapsed ? <div className="matricula-v2-sidebar__section-label">Principal</div> : null}
        <SidebarItem
          icon={<DashboardOutlined />}
          label="Dashboard"
          collapsed={collapsed}
          onClick={nav('/dashboard')}
        />
        <SidebarSection icon={<IdcardOutlined />} label="Matrícula" defaultOpen collapsed={collapsed}>
          <SidebarItem
            icon={<UnorderedListOutlined />}
            label="Matrículas"
            sub
            active={isMatriculas}
            collapsed={collapsed}
            onClick={nav('/matricula/listar-v2')}
          />
          <SidebarItem
            icon={<UserAddOutlined />}
            label="Nueva inscripción"
            sub
            collapsed={collapsed}
            onClick={nav('/matricula/nueva')}
          />
        </SidebarSection>
        <SidebarSection icon={<ReadOutlined />} label="Académico" collapsed={collapsed}>
          <SidebarItem icon={<UnorderedListOutlined />} label="Materias" sub collapsed={collapsed} />
        </SidebarSection>
        <SidebarItem icon={<TeamOutlined />} label="Docentes" collapsed={collapsed} />
        <SidebarItem icon={<DollarOutlined />} label="Finanzas" collapsed={collapsed} />
        <SidebarItem icon={<BankOutlined />} label="Institucional" collapsed={collapsed} />
        <SidebarItem icon={<BarChartOutlined />} label="Reportes" collapsed={collapsed} />
        <SidebarItem icon={<SafetyOutlined />} label="Seguridad" collapsed={collapsed} />
        <SidebarItem icon={<SettingOutlined />} label="Configuración" collapsed={collapsed} />
      </nav>

      <div className="matricula-v2-sidebar__footer">
        <div className="matricula-v2-sidebar__avatar">{userInitials}</div>
        {!collapsed ? (
          <div className="matricula-v2-sidebar__footer-text">
            <div className="matricula-v2-sidebar__user-name" title={userName}>
              {userName}
            </div>
            <div className="matricula-v2-sidebar__user-role">{userRole}</div>
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default MatriculaV2Sidebar;
