/**
 * SidebarUserFooter — molécula compartida (nivel: molécula).
 *
 * Footer de usuario del sidebar: avatar con iniciales, nombre y rol.
 * Nombre en orden §4b: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (excepción
 * de ficha no aplica — aquí es colección de un solo usuario logueado,
 * pero el helper buildFullName ya garantiza el orden correcto).
 *
 * Usa tokens conmutables --brand-* / --text (brand-tokens.css).
 *
 * @module presentation/components/molecules/SidebarUserFooter
 * @level molécula
 */

import { useAuthContext } from '@application-auth';
import { buildFullName } from '@application/utils';

/**
 * Deriva las iniciales del nombre completo (máx. 2 caracteres).
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  const parts = String(name || 'U').trim().split(/\s+/);
  return (
    (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
  ).toUpperCase() || 'U';
}

/**
 * @param {{ collapsed: boolean }} props
 */
const SidebarUserFooter = ({ collapsed = false }) => {
  const { user } = useAuthContext();

  // Orden §4b: apellidoPaterno apellidoMaterno nombres (helper buildFullName)
  const displayName =
    user?.nombreCompleto ||
    buildFullName(user?.nombres, user?.apellidoPaterno, user?.apellidoMaterno, '') ||
    user?.username ||
    'Usuario';

  const userRole = user?.rol?.nombre || user?.rolNombre || 'Usuario';
  const initials = getInitials(displayName);

  return (
    <div className="sidebar-user-footer">
      <div className="sidebar-user-footer__avatar" aria-hidden>
        {initials}
      </div>
      {!collapsed && (
        <div className="sidebar-user-footer__text">
          <div className="sidebar-user-footer__name" title={displayName}>
            {displayName}
          </div>
          <div className="sidebar-user-footer__role">{userRole}</div>
        </div>
      )}
    </div>
  );
};

export default SidebarUserFooter;
