/**
 * Sidebar — navegación principal (organismo del shell).
 *
 * Responsabilidad: pintar el modelo de navegación (config) con estado activo por
 * ruta y delegar la navegación al router. No define los ítems (vienen de config) ni
 * conoce permisos (RBAC se aplicará filtrando el modelo, sin tocar este componente).
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationModel } from '@config/navigation';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useSession } from '@lib/session/useSession';
import { Logo } from '@ui/atoms/Logo/Logo';
import { SidebarItem } from '@ui/molecules/SidebarItem/SidebarItem';
import { SidebarSection } from '@ui/molecules/SidebarSection/SidebarSection';
import { SidebarFooter } from '@ui/molecules/SidebarFooter/SidebarFooter';
import './Sidebar.css';

function isActivePath(pathname, path) {
  if (!path) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Sidebar({ collapsed = false, isMobile = false, mobileOpen = false, onNavigate }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (path) => () => {
    if (path) navigate(path);
    onNavigate?.();
  };

  const width = isMobile ? 260 : collapsed ? 76 : 252;
  const className = [
    'ds-sidebar',
    isMobile ? 'ds-sidebar--mobile' : '',
    isMobile && mobileOpen ? 'ds-sidebar--mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderItem = (item) => {
    if (item.children?.length) {
      const hasActiveChild = item.children.some((c) => isActivePath(pathname, c.path));
      const Icon = item.icon;
      return (
        <SidebarSection
          key={item.key}
          icon={Icon ? <Icon /> : null}
          label={t(item.labelKey)}
          defaultOpen={item.defaultOpen || hasActiveChild}
          collapsed={collapsed}
          hasActiveChild={hasActiveChild}
        >
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <SidebarItem
                key={child.key}
                icon={ChildIcon ? <ChildIcon /> : null}
                label={t(child.labelKey)}
                sub
                active={isActivePath(pathname, child.path)}
                collapsed={collapsed}
                onClick={go(child.path)}
              />
            );
          })}
        </SidebarSection>
      );
    }
    const Icon = item.icon;
    return (
      <SidebarItem
        key={item.key}
        icon={Icon ? <Icon /> : null}
        label={t(item.labelKey)}
        active={isActivePath(pathname, item.path)}
        collapsed={collapsed}
        onClick={go(item.path)}
      />
    );
  };

  return (
    <aside className={className} style={{ width }} aria-label={t('nav.main')}>
      <div className="ds-sidebar__logo">
        <Logo collapsed={collapsed} />
      </div>

      <nav className="ds-sidebar__nav">
        {navigationModel.map((section) => (
          <div key={section.sectionKey} className="ds-sidebar__group">
            {!collapsed ? (
              <div className="ds-sidebar__section-label">{t(section.sectionKey)}</div>
            ) : null}
            {section.items.map(renderItem)}
          </div>
        ))}
      </nav>

      <SidebarFooter name={user.name} role={user.role} collapsed={collapsed} />
    </aside>
  );
}

export default Sidebar;
