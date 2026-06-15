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
import Stagger from '@presentation/components/atoms/motion/Stagger';
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
 * @param {boolean} [isSub=false] - true cuando el ítem está dentro de una sección (nivel 2)
 * @returns {import('react').ReactNode}
 */
function renderItem(item, ctx, isSub = false) {
  const { selectedKeys, openKeys, handleMenuClick, handleOpenChange, collapsed } = ctx;

  if (item.children?.length) {
    // Sección acordeón — los hijos directos son sub-ítems (nivel 2)
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
        {item.children.map((child) => renderItem(child, ctx, true))}
      </SidebarSection>
    );
  }

  // Ítem hoja — recibe sub=true cuando está anidado dentro de una sección
  return (
    <SidebarItem
      key={item.key}
      icon={item.icon}
      label={item.label}
      active={isActive(item.key, selectedKeys)}
      sub={isSub}
      collapsed={collapsed}
      onClick={() => handleMenuClick({ key: item.key })}
    />
  );
}

/**
 * Agrupa los ítems raíz por su propiedad `group` (metadata de UI).
 * Ítems sin grupo van en un grupo implícito con key '' (sin label visible).
 * El orden dentro de cada grupo se preserva (viene pre-ordenado del menuGenerator).
 *
 * @param {Array} items - menuItemsWithIcons (ya filtrado por permisos)
 * @returns {{ groupKey: string, label: string|null, items: Array }[]}
 */
function groupMenuItems(items) {
  const groups = [];
  const groupMap = new Map();

  items.forEach((item) => {
    const groupKey = item.group || '';
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, { groupKey, label: item.group || null, items: [] });
      groups.push(groupMap.get(groupKey));
    }
    groupMap.get(groupKey).items.push(item);
  });

  return groups;
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
  const groups = groupMenuItems(menuItemsWithIcons);

  return (
    /* Stagger: entrada escalonada por grupo de menú al montar (jerarquía de carga).
       Motivo motivado (emit-design-eng): el shell tiene muchos ítems — el stagger
       evita el "todo a la vez" y da sensación de profundidad. Gate reduced-motion
       en Stagger.Item (solo opacity, sin y). */
    <Stagger as="nav" className="navigation-menu-custom" aria-label="Menú principal">
      {groups.map(({ groupKey, label, items }) => (
        <Stagger.Item key={groupKey || '__default'}>
          {/* Section-label visible solo cuando hay label Y el sidebar no está colapsado */}
          {label && !collapsed && (
            <div className="nav-section-label" aria-hidden>
              {label}
            </div>
          )}
          {items.map((item) => renderItem(item, ctx))}
        </Stagger.Item>
      ))}
    </Stagger>
  );
};

export default NavigationMenu;
