/**
 * SidebarItem — átomo/molécula del ítem hoja del menú lateral.
 *
 * Botón accesible con aria-current, hover translateX+tint (mv2), barra lateral
 * de ítem activo. Toda animación gateada por prefers-reduced-motion.
 *
 * NO contiene lógica de routing ni permisos — los recibe por props.
 * El componente es agnóstico del proveedor de navegación.
 *
 * @module presentation/components/molecules/SidebarItem
 * @level molécula
 */

/**
 * @param {{
 *   icon?: import('react').ReactNode
 *   label: string
 *   active?: boolean
 *   sub?: boolean
 *   collapsed?: boolean
 *   onClick: () => void
 * }} props
 */
const SidebarItem = ({ icon, label, active = false, sub = false, collapsed = false, onClick }) => {
  const classes = [
    'sidebar-item',
    active ? 'sidebar-item--active' : '',
    sub ? 'sidebar-item--sub' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={classes}
      style={{
        paddingLeft: sub && !collapsed ? 44 : undefined,
        justifyContent: collapsed ? 'center' : undefined,
        paddingRight: collapsed ? 0 : undefined,
      }}
    >
      {active && <span className="sidebar-item__bar" aria-hidden />}
      {icon && <span className="sidebar-item__icon">{icon}</span>}
      {!collapsed && <span className="sidebar-item__label">{label}</span>}
    </button>
  );
};

export default SidebarItem;
