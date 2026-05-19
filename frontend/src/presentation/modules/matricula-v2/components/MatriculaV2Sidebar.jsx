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
  DownOutlined,
  GiftOutlined,
  IdcardOutlined,
  ReadOutlined,
  RightOutlined,
  SafetyOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import logoHorizontal from '@assets/images/branding/logo-horizontal.webp';

function SidebarItem({ icon, label, active, sub, onClick, collapsed }) {
  const [hover, setHover] = useState(false);
  const bg = active ? 'var(--brand-50)' : hover ? 'rgba(13,110,61,0.05)' : 'transparent';
  const color = active ? 'var(--brand-700)' : 'var(--text-2)';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="matricula-v2-sidebar__item"
      style={{
        background: bg,
        color,
        fontWeight: active ? 600 : 500,
        padding: collapsed ? '10px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        paddingLeft: sub && !collapsed ? 44 : collapsed ? 0 : 14,
      }}
    >
      {active && !collapsed ? (
        <span className="matricula-v2-sidebar__item-bar" aria-hidden />
      ) : null}
      <span className="matricula-v2-sidebar__item-icon">{icon}</span>
      {!collapsed ? <span style={{ flex: 1 }}>{label}</span> : null}
    </div>
  );
}

function SidebarSection({ icon, label, children, defaultOpen, collapsed }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hover, setHover] = useState(false);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o);
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="matricula-v2-sidebar__item"
        style={{
          background: hover ? 'rgba(13,110,61,0.05)' : 'transparent',
          color: 'var(--text-2)',
          fontWeight: 500,
          padding: collapsed ? '10px 0' : '10px 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <span className="matricula-v2-sidebar__item-icon">{icon}</span>
        {!collapsed ? (
          <>
            <span style={{ flex: 1 }}>{label}</span>
            <span style={{ fontSize: 10, color: 'var(--text-soft)' }}>
              {open ? <DownOutlined /> : <RightOutlined />}
            </span>
          </>
        ) : null}
      </div>
      {open && !collapsed ? <div style={{ paddingBottom: 4 }}>{children}</div> : null}
    </div>
  );
}

/**
 * @param {{ collapsed?: boolean }} props
 */
const MatriculaV2Sidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const width = collapsed ? 76 : 252;
  const isMatriculas =
    location.pathname === '/matricula/listar-v2' || location.pathname === '/matricula/listar';

  return (
    <aside
      className="matricula-v2-sidebar"
      style={{ width }}
      aria-label="Navegación principal"
    >
      <div className="matricula-v2-sidebar__logo">
        {collapsed ? (
          <div className="matricula-v2-sidebar__logo-icon">IT</div>
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
          onClick={() => navigate('/dashboard')}
        />
        <SidebarSection icon={<IdcardOutlined />} label="Matrícula" defaultOpen collapsed={collapsed}>
          <SidebarItem
            icon={<UnorderedListOutlined />}
            label="Matrículas"
            sub
            active={isMatriculas}
            collapsed={collapsed}
            onClick={() => navigate('/matricula/listar-v2')}
          />
          <SidebarItem
            icon={<UserAddOutlined />}
            label="Nueva inscripción"
            sub
            collapsed={collapsed}
            onClick={() => navigate('/matricula/nueva')}
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
        <div className="matricula-v2-sidebar__avatar">U</div>
        {!collapsed ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="matricula-v2-sidebar__user-name">Usuario</div>
            <div className="matricula-v2-sidebar__user-role">Administrador</div>
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default MatriculaV2Sidebar;
