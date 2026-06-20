/**
 * SidebarSection — grupo colapsable (acordeón) con chevron rotatorio.
 * Molécula: gobierna solo su apertura local; los hijos se inyectan por props.
 */
import { useState } from 'react';
import { RightOutlined } from '@ant-design/icons';

export function SidebarSection({ icon, label, children, defaultOpen = false, collapsed = false, hasActiveChild = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = open && !collapsed;

  return (
    <div className="ds-sidebar-section">
      <button
        type="button"
        className={`ds-sidebar-item${hasActiveChild ? ' ds-sidebar-item--active' : ''}${
          collapsed ? ' ds-sidebar-item--collapsed' : ''
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        title={collapsed ? label : undefined}
      >
        {hasActiveChild ? <span className="ds-sidebar-item__bar" aria-hidden /> : null}
        <span className="ds-sidebar-item__icon">{icon}</span>
        {!collapsed ? (
          <>
            <span className="ds-sidebar-item__label">{label}</span>
            <span
              className={`ds-sidebar-section__chevron${expanded ? ' ds-sidebar-section__chevron--open' : ''}`}
              aria-hidden
            >
              <RightOutlined />
            </span>
          </>
        ) : null}
      </button>
      {!collapsed ? (
        <div className={`ds-sidebar-section__submenu${expanded ? ' ds-sidebar-section__submenu--open' : ''}`}>
          <div className="ds-sidebar-section__submenu-inner">{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export default SidebarSection;
