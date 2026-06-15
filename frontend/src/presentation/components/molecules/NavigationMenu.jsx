// src/presentation/components/molecules/NavigationMenu.jsx
/**
 * NavigationMenu — renderer del menú de navegación (lenguaje visual mv2).
 *
 * RBAC-safe: NO toca la maquinaria de permisos. Consume `useNavigationContext`
 * que ya expone `menuItemsWithIcons` pre-filtrado por `filterMenuByPermiso`.
 * Este componente SOLO mapea los datos a `SidebarItem`/`SidebarSection`.
 *
 * Items con `children` → SidebarSection (acordeón).
 * Items sin `children` → SidebarItem (hoja, navegable).
 *
 * Dependency Inversion: depende del contexto (abstracción), no del proveedor.
 *
 * @module presentation/components/molecules/NavigationMenu
 * @level molécula
 */

import { useNavigationContext } from '@application-navigation';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';

/**
 * Determina si una key está activa (directa o como ancestro de selectedKeys).
 * @param {string} key
 * @param {string[]} selectedKeys
 * @returns {boolean}
 */
function isActive(key, selectedKeys) {
  return selectedKeys.includes(key);
}

/**
 * Determina si una sección está abierta (via openKeys del contexto).
 * @param {string} key
 * @param {string[]} openKeys
 * @returns {boolean}
 */
function isSectionOpen(key, openKeys) {
  return openKeys.includes(key);
}

/**
 * Renderiza recursivamente un ítem (hoja o sección) del menú.
 * @param {object} item - Ítem de menuItemsWithIcons
 * @param {{ selectedKeys, openKeys, handleMenuClick, handleOpenChange, collapsed }} ctx
 * @returns {import('react').ReactNode}
 */
function renderItem(item, ctx) {
  const { selectedKeys, openKeys, handleMenuClick, handleOpenChange, collapsed } = ctx;

  if (item.children?.length) {
    // Sección acordeón
    const open = isSectionOpen(item.key, openKeys);
    return (
      <SidebarSection
        key={item.key}
        sectionKey={item.key}
        icon={item.icon}
        label={item.label}
        open={open}
        collapsed={collapsed}
        onToggle={(key) => {
          // handleOpenChange espera el array de keys abiertas (como AntD Menu)
          const next = open
            ? openKeys.filter((k) => k !== key)
            : [...openKeys, key];
          handleOpenChange(next);
        }}
      >
        {item.children.map((child) => renderItem(child, ctx))}
      </SidebarSection>
    );
  }

  // Ítem hoja
  return (
    <SidebarItem
      key={item.key}
      icon={item.icon}
      label={item.label}
      active={isActive(item.key, selectedKeys)}
      collapsed={collapsed}
      onClick={() => handleMenuClick({ key: item.key })}
    />
  );
}

/**
 * @param {{ collapsed?: boolean }} props
 */
const NavigationMenu = ({ collapsed = false }) => {
  const {
    selectedKeys,
    openKeys,
    menuItemsWithIcons,
    handleMenuClick,
    handleOpenChange,
  } = useNavigationContext();

  const ctx = { selectedKeys, openKeys, handleMenuClick, handleOpenChange, collapsed };

  return (
    <nav className="navigation-menu-custom" aria-label="Menú principal">
      {menuItemsWithIcons.map((item) => renderItem(item, ctx))}
    </nav>
  );
};

export default NavigationMenu;
