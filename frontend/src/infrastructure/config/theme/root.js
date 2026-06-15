// src/infrastructure/config/theme/root.js
/**
 * Generador de variables CSS desde el tema de Ant Design
 * Este archivo sincroniza las variables CSS con el tema JS e inyecta en :root
 * 
 * TODAS las variables CSS se generan desde el tema JS (single source of truth)
 * y se inyectan en el elemento root del HTML (document.documentElement)
 * 
 * Responsabilidad: Inyectar variables CSS en :root desde la configuración del tema
 * Ubicación: Infrastructure/theme (parte del sistema de tema)
 */

import { allThemeTokens, componentConfig } from '@theme/tokens';

/**
 * Genera TODAS las variables CSS desde el tema JS
 * Se inyecta en el DOM al cargar la aplicación
 */
export function injectCSSVariables() {
  const root = document.documentElement;

  // ========================================
  // COLORES DE COMPONENTES LAYOUT
  // (Solo las variables que se usan en CSS)
  // ========================================

  // Content - Variables CSS usadas en global.css
  root.style.setProperty('--color-content-bg', componentConfig.Layout.bodyBg);
  root.style.setProperty('--color-content-text', allThemeTokens.colorText);
  root.style.setProperty('--color-bg-layout', allThemeTokens.colorBgLayout);
  root.style.setProperty('--color-bg-container', allThemeTokens.colorBgContainer); // Para DataCards y otros componentes
  root.style.setProperty('--color-bg-elevated', allThemeTokens.colorBgElevated);
  
  // Color verde institucional (usado en reset.css para focus y Tags)
  root.style.setProperty('--color-verde-main', allThemeTokens.colorPrimary);
  root.style.setProperty('--color-primary', allThemeTokens.colorPrimary); // Para uso en list-item.css y otros componentes
  root.style.setProperty('--color-primary-hover', allThemeTokens.colorPrimaryHover);
  root.style.setProperty('--color-primary-bg', allThemeTokens.colorPrimaryBg);
  root.style.setProperty('--color-primary-bg-hover', allThemeTokens.colorPrimaryBgHover);
  root.style.setProperty('--color-primary-border', allThemeTokens.colorPrimaryBorder);
  root.style.setProperty('--color-primary-text', allThemeTokens.colorPrimaryText);
  root.style.setProperty('--color-primary-active', allThemeTokens.colorPrimaryActive);
  root.style.setProperty('--color-fill-quaternary', allThemeTokens.colorBgSpotlight);

  // ========================================
  // ICON BUTTON - Variables CSS simples
  // ========================================
  root.style.setProperty('--color-icon-button', componentConfig.IconButton.color);
  root.style.setProperty('--color-icon-button-hover-bg', componentConfig.IconButton.colorHoverBg);
  root.style.setProperty('--color-icon-button-hover-text', componentConfig.IconButton.colorHoverText);
  root.style.setProperty('--color-icon-button-active-bg', componentConfig.IconButton.colorActiveBg);
  root.style.setProperty('--color-icon-button-active-text', componentConfig.IconButton.colorActiveText);
  root.style.setProperty('--color-icon-button-disabled-bg', componentConfig.IconButton.colorDisabledBg);
  root.style.setProperty('--color-icon-button-disabled-text', componentConfig.IconButton.colorDisabledText);

  // ========================================
  // COLORES SEMÁNTICOS - Para variantes de IconButton y Button
  // Generados automáticamente desde SemanticButtons
  // ========================================
  const semanticVariants = ['info', 'success', 'warning', 'error'];
  
  semanticVariants.forEach((variant) => {
    const semantic = componentConfig.SemanticButtons[variant];
    // Variables para IconButton (solo color e interacciones)
    root.style.setProperty(`--color-${variant}`, semantic.color);
    root.style.setProperty(`--color-${variant}-hover`, semantic.colorHover);
    root.style.setProperty(`--color-${variant}-active`, semantic.colorActive);
    root.style.setProperty(`--color-${variant}-text-hover`, semantic.colorTextHover);
    
    // Variables para Button (filled y outlined)
    root.style.setProperty(`--color-${variant}-bg`, semantic.colorBg);
    root.style.setProperty(`--color-${variant}-bg-hover`, semantic.colorBgHover);
    root.style.setProperty(`--color-${variant}-border`, semantic.colorBorder);
    root.style.setProperty(`--color-${variant}-border-hover`, semantic.colorBorderHover);
    root.style.setProperty(`--color-${variant}-text`, semantic.colorText);
    root.style.setProperty(`--color-${variant}-text-disabled`, semantic.colorTextDisabled);
    root.style.setProperty(`--color-${variant}-bg-disabled`, semantic.colorBgDisabled);
  });

  // ========================================
  // COLOR ACCENT - Variables CSS para el color de acento (púrpura/violeta)
  // ========================================
  root.style.setProperty('--color-accent', allThemeTokens.colorAccent);
  root.style.setProperty('--color-accent-hover', allThemeTokens.colorAccentHover);
  root.style.setProperty('--color-accent-active', allThemeTokens.colorAccentActive);
  root.style.setProperty('--color-accent-bg', allThemeTokens.colorAccentBg);
  root.style.setProperty('--color-accent-bg-hover', allThemeTokens.colorAccentBgHover);
  root.style.setProperty('--color-accent-border', allThemeTokens.colorAccentBorder);
  root.style.setProperty('--color-accent-border-hover', allThemeTokens.colorAccentBorderHover);
  root.style.setProperty('--color-accent-text', allThemeTokens.colorAccentText);
  root.style.setProperty('--color-accent-text-hover', allThemeTokens.colorAccentTextHover);
  root.style.setProperty('--color-accent-text-disabled', allThemeTokens.colorAccentTextDisabled);
  root.style.setProperty('--color-accent-bg-disabled', allThemeTokens.colorAccentBgDisabled);

  // ========================================
  // AVATAR - Variables CSS
  // ========================================
  root.style.setProperty('--color-avatar-bg', componentConfig.Avatar.colorBgContainer);
  root.style.setProperty('--color-avatar-text', componentConfig.Avatar.colorText);
  root.style.setProperty('--color-avatar-text-hover', componentConfig.Avatar.colorTextHover);
  root.style.setProperty('--color-avatar-border', componentConfig.Avatar.colorBorder);

  // ========================================
  // MENU - Variables CSS (para NavigationMenu)
  // ========================================
  root.style.setProperty('--color-menu-item', componentConfig.Menu.itemColor);
  root.style.setProperty('--color-menu-item-selected-bg', componentConfig.Menu.itemSelectedBg);
  root.style.setProperty('--color-menu-item-selected-color', componentConfig.Menu.itemSelectedColor);
  root.style.setProperty('--color-menu-item-hover-bg', componentConfig.Menu.itemHoverBg);
  root.style.setProperty('--color-menu-item-hover-color', componentConfig.Menu.itemHoverColor);
  // Items activos (padres seleccionados directamente)
  root.style.setProperty('--color-menu-item-active-bg', componentConfig.Menu.itemActiveBg);
  root.style.setProperty('--color-menu-item-active-color', componentConfig.Menu.itemActiveColor);
  root.style.setProperty('--color-menu-item-active-border', componentConfig.Menu.itemActiveBorder);
  // Items padre cuando tienen un hijo seleccionado
  root.style.setProperty('--color-menu-item-parent-selected-bg', componentConfig.Menu.itemParentSelectedBg);
  root.style.setProperty('--color-menu-item-parent-selected-border', componentConfig.Menu.itemParentSelectedBorder);
  root.style.setProperty('--color-menu-item-parent-selected-color', componentConfig.Menu.itemParentSelectedColor);

  // ========================================
  // TABLE - Variables CSS (para DataTable)
  // Solo variables para estilos personalizados que Ant Design no maneja directamente
  // ========================================
  root.style.setProperty('--color-table-header-sorted-bg', componentConfig.Table.headerSortedBg);
  root.style.setProperty('--color-table-header-sorted-color', componentConfig.Table.headerSortedColor);
  root.style.setProperty('--color-table-header-sorted-hover-bg', componentConfig.Table.headerSortedHoverBg);
  root.style.setProperty('--color-table-row-hover-bg', componentConfig.Table.rowHoverBg);
  
  // ========================================
  // ITEM HOVER - Variable genérica para hover de items (tablas, listas, etc.)
  // Reutiliza colorAccentOliveBg que se usa tanto en Table como en List
  // ========================================
  root.style.setProperty('--color-item-hover-bg', allThemeTokens.colorAccentOliveBg);
  
  // Variables de borde y texto usadas en múltiples componentes
  root.style.setProperty('--color-border-secondary', allThemeTokens.colorBorderSecondary);
  root.style.setProperty('--color-border', allThemeTokens.colorBorder);
  root.style.setProperty('--color-text', allThemeTokens.colorText);
  root.style.setProperty('--color-text-secondary', allThemeTokens.colorTextSecondary);
  root.style.setProperty('--color-text-tertiary', allThemeTokens.colorTextTertiary);
  
  // Color blanco (para texto sobre fondos primarios, estados activos, etc.)
  root.style.setProperty('--color-white', allThemeTokens.colorWhite);

  // ========================================
  // BREADCRUMB - Variables CSS (componente personalizado)
  // ========================================
  root.style.setProperty('--color-breadcrumb', componentConfig.Breadcrumb.color);
  root.style.setProperty('--color-breadcrumb-hover', componentConfig.Breadcrumb.colorHover);
  root.style.setProperty('--color-breadcrumb-text', componentConfig.Breadcrumb.colorText);
  root.style.setProperty('--color-breadcrumb-text-hover', componentConfig.Breadcrumb.colorTextHover);
  root.style.setProperty('--color-breadcrumb-separator', componentConfig.Breadcrumb.colorSeparator);

  // ========================================
  // SOMBRAS (Desde componentConfig para mantener consistencia)
  // ========================================
  root.style.setProperty('--sombra-sider', componentConfig.Sider.boxShadow);
  root.style.setProperty('--sombra-header', componentConfig.Header.boxShadow);
  root.style.setProperty('--sombra-documento', allThemeTokens.shadowElevation3);
  root.style.setProperty('--shadow-elevation-1', allThemeTokens.shadowElevation1);
  root.style.setProperty('--shadow-elevation-2', allThemeTokens.shadowElevation2);
  root.style.setProperty('--shadow-elevation-3', allThemeTokens.shadowElevation3);
  root.style.setProperty('--shadow-primary', allThemeTokens.shadowPrimary);
  root.style.setProperty('--shadow-primary-hover', allThemeTokens.shadowPrimaryHover);
  root.style.setProperty('--shadow-info', allThemeTokens.shadowInfo);
  root.style.setProperty('--shadow-info-hover', allThemeTokens.shadowInfoHover);
  root.style.setProperty('--shadow-accent', allThemeTokens.shadowAccent);
  root.style.setProperty('--shadow-accent-hover', allThemeTokens.shadowAccentHover);
  root.style.setProperty('--shadow-warning', allThemeTokens.shadowWarning);

  // ========================================
  // ESPACIADO (Solo lo necesario para Layout y componentes)
  // ========================================
  root.style.setProperty('--spacing-xs', `${allThemeTokens.marginXS}px`);
  root.style.setProperty('--spacing-sm', `${allThemeTokens.marginSM}px`);
  root.style.setProperty('--spacing-base', `${allThemeTokens.margin}px`);
  root.style.setProperty('--spacing-md', `${allThemeTokens.marginMD}px`);
  root.style.setProperty('--spacing-lg', `${allThemeTokens.marginLG}px`);
  root.style.setProperty('--spacing-xl', `${allThemeTokens.marginXL}px`);
  root.style.setProperty('--spacing-xxl', `${allThemeTokens.marginXXL}px`);
  // Padding específicos para tablas
  root.style.setProperty('--table-header-padding-vertical', `${allThemeTokens.paddingMD}px`);
  root.style.setProperty('--table-header-padding-horizontal', `${allThemeTokens.paddingMD}px`);
  root.style.setProperty('--table-cell-padding-vertical', `${allThemeTokens.padding}px`);
  root.style.setProperty('--table-cell-padding-horizontal', `${allThemeTokens.paddingMD}px`);

  // ========================================
  // ALTURAS Y ANCHOS DE LAYOUT
  // ========================================
  root.style.setProperty('--header-height', `${allThemeTokens.headerHeight}px`);
  root.style.setProperty('--sidebar-width', `${allThemeTokens.sidebarWidth}px`);
  root.style.setProperty('--sidebar-collapsed-width', `${allThemeTokens.sidebarCollapsedWidth}px`);

  // Control heights (para botones y menús)
  root.style.setProperty('--control-height', `${allThemeTokens.controlHeight}px`);

  // ========================================
  // LOGO - Tamaños
  // ========================================
  // Logo icono
  root.style.setProperty('--logo-icon-small', `${allThemeTokens.logoIconSmall}px`);
  root.style.setProperty('--logo-icon-medium', `${allThemeTokens.logoIconMedium}px`);
  root.style.setProperty('--logo-icon-large', `${allThemeTokens.logoIconLarge}px`);

  // Logo horizontal
  root.style.setProperty('--logo-horizontal-small-width', `${allThemeTokens.logoHorizontalSmall}px`);
  root.style.setProperty('--logo-horizontal-small-height', `${allThemeTokens.logoHorizontalSmallHeight}px`);
  root.style.setProperty('--logo-horizontal-medium-width', `${allThemeTokens.logoHorizontalMedium}px`);
  root.style.setProperty('--logo-horizontal-medium-height', `${allThemeTokens.logoHorizontalMediumHeight}px`);
  root.style.setProperty('--logo-horizontal-large-width', `${allThemeTokens.logoHorizontalLarge}px`);
  root.style.setProperty('--logo-horizontal-large-height', `${allThemeTokens.logoHorizontalLargeHeight}px`);

  // ========================================
  // Z-INDEX
  // ========================================
  root.style.setProperty('--z-fixed', '1030');
  root.style.setProperty('--z-popup-base', `${allThemeTokens.zIndexPopupBase}`);

  // ========================================
  // BORDER RADIUS (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente borderRadius desde componentConfig
  // Solo definimos variables para casos específicos de layout y componentes
  root.style.setProperty('--border-radius-xs', `${allThemeTokens.borderRadiusXS}px`);
  root.style.setProperty('--border-radius-sm', `${allThemeTokens.borderRadiusSM}px`);
  root.style.setProperty('--border-radius', `${allThemeTokens.borderRadius}px`);
  root.style.setProperty('--border-radius-md', `${allThemeTokens.borderRadiusMD}px`);
  root.style.setProperty('--border-radius-lg', `${allThemeTokens.borderRadiusLG}px`);

  // ========================================
  // TIPOGRAFÍA (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente fontSize desde componentConfig.Typography
  // Solo definimos variables para casos específicos de layout
  root.style.setProperty('--font-family-base', allThemeTokens.fontFamily);
  root.style.setProperty('--font-family-heading', allThemeTokens.fontFamily);
  root.style.setProperty('--font-size-base', `${allThemeTokens.fontSize}px`);
  root.style.setProperty('--font-size-sm', `${allThemeTokens.fontSizeSM}px`);
  root.style.setProperty('--font-size-xs', `${allThemeTokens.fontSizeXS}px`);
  root.style.setProperty('--font-size-lg', `${allThemeTokens.fontSizeLG}px`);
  root.style.setProperty('--line-height-normal', `${allThemeTokens.lineHeight}`);
  root.style.setProperty('--line-height-sm', `${allThemeTokens.lineHeightSM}`);
  root.style.setProperty('--line-height-lg', `${allThemeTokens.lineHeightLG}`);
  root.style.setProperty('--font-weight-strong', `${allThemeTokens.fontWeightStrong}`);

  // ========================================
  // TRANSICIONES
  // ========================================
  root.style.setProperty('--transition-base', allThemeTokens.motionDurationMid);
  
}
