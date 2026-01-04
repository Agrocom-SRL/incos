// src/infrastructure/config/theme/components/navigation.js
/**
 * Navigation Components - Componentes de navegación
 * Menu, Tooltip
 */

import { allColors } from '../colors';
import { allSpacing } from '../spacing';

/**
 * Menu - Menú de navegación del Sidebar
 * Usa colores del Sider como base y verde primario para estados activos/seleccionados
 */
export const Menu = {
  // Color de texto: mismo que Sider
  itemColor: allColors.colorText,
  // Items seleccionados (solo hijos finales)
  itemSelectedBg: allColors.colorPrimary,
  itemSelectedColor: allColors.colorPrimaryTextHover,
  // Items en hover
  itemHoverBg: allColors.colorPrimaryBg,
  itemHoverColor: allColors.colorPrimary,
  // Items activos (padres seleccionados directamente, sin hijos seleccionados)
  itemActiveBg: allColors.colorPrimaryBg,
  itemActiveColor: allColors.colorPrimary,
  itemActiveBorder: allColors.colorPrimaryBorder,
  // Fondo del menú (transparente para usar el del Sider)
  subMenuItemBg: 'transparent',
  // Items padre cuando tienen un hijo seleccionado
  itemParentSelectedBg: allColors.colorPrimaryBg,
  itemParentSelectedBorder: allColors.colorPrimary,
  itemParentSelectedColor: allColors.colorPrimary,
};

/**
 * Tooltip - Tooltips del menú cuando el sidebar está colapsado
 */
export const Tooltip = {
  colorBgSpotlight: allColors.colorBgTooltip,
  borderRadius: allSpacing.borderRadiusMD,
  paddingBlock: allSpacing.paddingLG,
  paddingInline: allSpacing.paddingLG,
};

/**
 * Breadcrumb - Navegación breadcrumb (componente personalizado)
 * Usa colorAccentBrown para diferenciarse del heading title
 */
export const Breadcrumb = {
  color: allColors.colorAccentBrownActive,
  colorHover: allColors.colorAccentBrownHover,
  colorText: allColors.colorPrimaryText,
  colorTextHover: allColors.colorAccentOliveText,
  colorSeparator: allColors.colorAccentBrownActive,
};
