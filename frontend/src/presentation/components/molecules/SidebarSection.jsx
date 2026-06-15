/**
 * SidebarSection — molécula de sección-acordeón del menú lateral.
 *
 * Botón de sección con chevron rotatorio; contenido colapsable vía
 * grid-template-rows (CSS, sin JS de altura). Estado open/close controlado
 * externamente (openKeys/handleOpenChange del NavigationContext).
 *
 * Toda animación gateada por prefers-reduced-motion (ver brand-tokens.css).
 *
 * @module presentation/components/molecules/SidebarSection
 * @level molécula
 */

import { RightOutlined } from '@ant-design/icons';

/**
 * @param {{
 *   icon?: import('react').ReactNode
 *   label: string
 *   sectionKey: string
 *   open?: boolean
 *   collapsed?: boolean
 *   onToggle: (key: string) => void
 *   children: import('react').ReactNode
 * }} props
 */
const SidebarSection = ({
  icon,
  label,
  sectionKey,
  open = false,
  collapsed = false,
  onToggle,
  children,
}) => {
  const expanded = open && !collapsed;

  return (
    <div className="sidebar-section">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        aria-expanded={expanded}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        className="sidebar-item sidebar-section__toggle"
        style={{
          justifyContent: collapsed ? 'center' : undefined,
        }}
      >
        {icon && <span className="sidebar-item__icon">{icon}</span>}
        {!collapsed && (
          <>
            <span className="sidebar-item__label">{label}</span>
            <span
              className={`sidebar-section__chevron${expanded ? ' sidebar-section__chevron--open' : ''}`}
              aria-hidden
            >
              <RightOutlined />
            </span>
          </>
        )}
      </button>

      {!collapsed && (
        <div
          className={`sidebar-section__submenu${expanded ? ' sidebar-section__submenu--open' : ''}`}
          aria-hidden={!expanded}
        >
          <div className="sidebar-section__submenu-inner">{children}</div>
        </div>
      )}
    </div>
  );
};

export default SidebarSection;
