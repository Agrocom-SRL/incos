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

import { allThemeTokens, componentConfig } from './tokens';

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
  
  // Color verde institucional (usado en reset.css para focus)
  root.style.setProperty('--color-verde-main', allThemeTokens.colorPrimary);

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
  // SOMBRAS (Desde componentConfig para mantener consistencia)
  // ========================================
  root.style.setProperty('--sombra-sider', componentConfig.Sider.boxShadow);
  root.style.setProperty('--sombra-header', componentConfig.Header.boxShadow);

  // ========================================
  // ESPACIADO (Solo lo necesario para Layout)
  // ========================================
  root.style.setProperty('--spacing-xs', `${allThemeTokens.marginXS}px`);
  root.style.setProperty('--spacing-sm', `${allThemeTokens.marginSM}px`);
  root.style.setProperty('--spacing-base', `${allThemeTokens.margin}px`);
  root.style.setProperty('--spacing-lg', `${allThemeTokens.marginLG}px`);
  root.style.setProperty('--spacing-xl', `${allThemeTokens.marginXL}px`);

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

  // ========================================
  // BORDER RADIUS (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente borderRadius desde componentConfig
  // Solo definimos variables para casos específicos de layout
  root.style.setProperty('--border-radius-sm', `${allThemeTokens.borderRadiusSM}px`);

  // ========================================
  // TIPOGRAFÍA (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente fontSize desde componentConfig.Typography
  // Solo definimos variables para casos específicos de layout
  root.style.setProperty('--font-family-base', allThemeTokens.fontFamily);
  root.style.setProperty('--font-family-heading', allThemeTokens.fontFamily);
  root.style.setProperty('--font-size-base', `${allThemeTokens.fontSize}px`);
  root.style.setProperty('--font-size-lg', `${allThemeTokens.fontSizeLG}px`);
  root.style.setProperty('--line-height-normal', `${allThemeTokens.lineHeight}`);

  // ========================================
  // TRANSICIONES
  // ========================================
  root.style.setProperty('--transition-base', allThemeTokens.motionDurationMid);
  
}
