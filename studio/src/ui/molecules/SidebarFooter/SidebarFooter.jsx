/**
 * SidebarFooter — identidad del usuario al pie del sidebar.
 * Molécula: compone Avatar + nombre + rol; datos por props (DIP).
 */
import { Avatar } from '@ui/atoms/Avatar/Avatar';

export function SidebarFooter({ name, role, collapsed = false }) {
  return (
    <div className="ds-sidebar-footer">
      <Avatar name={name} size={36} />
      {!collapsed ? (
        <div className="ds-sidebar-footer__text">
          <div className="ds-sidebar-footer__name" title={name}>
            {name}
          </div>
          <div className="ds-sidebar-footer__role">{role}</div>
        </div>
      ) : null}
    </div>
  );
}

export default SidebarFooter;
