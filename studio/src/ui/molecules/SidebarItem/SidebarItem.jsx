/**
 * SidebarItem — ítem de navegación (nivel 1 o sub-ítem indentado).
 * Molécula de presentación: recibe estado y handler; no conoce el router.
 */
export function SidebarItem({ icon, label, active = false, sub = false, collapsed = false, onClick }) {
  const className = [
    'ds-sidebar-item',
    active ? 'ds-sidebar-item--active' : '',
    sub ? 'ds-sidebar-item--sub' : '',
    collapsed ? 'ds-sidebar-item--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      {active ? <span className="ds-sidebar-item__bar" aria-hidden /> : null}
      <span className="ds-sidebar-item__icon">{icon}</span>
      {!collapsed ? <span className="ds-sidebar-item__label">{label}</span> : null}
    </button>
  );
}

export default SidebarItem;
