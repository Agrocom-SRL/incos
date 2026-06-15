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
 *   active?: boolean
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
  active = false,
  collapsed = false,
  onToggle,
  children,
}) => {
  const expanded = open && !collapsed;
  // En colapsado el padre activo es el ÚNICO indicador de módulo seleccionado
  // (los hijos de 2do nivel no se ven). En expandido da el cue de módulo activo.
  const toggleClass = [
    'sidebar-item',
    'sidebar-section__toggle',
    active ? 'sidebar-item--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sidebar-section">
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        aria-expanded={expanded}
        aria-current={active && collapsed ? 'page' : undefined}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        className={toggleClass}
        style={{
          justifyContent: collapsed ? 'center' : undefined,
        }}
      >
        {active && <span className="sidebar-item__bar" aria-hidden />}
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
