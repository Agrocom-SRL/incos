// src/styles/theme/css-variables.js
/**
 * Generador de variables CSS desde el tema de Ant Design
 * Este archivo sincroniza las variables CSS con el tema JS
 * 
 * TODAS las variables CSS se generan desde el tema JS (single source of truth)
 * 
 * FASE 1: Solo variables esenciales para Layout, Header, Sider, Content e IconButton
 */

import { allSpacing } from '@theme/spacing';
import { shadows } from '@theme/shadows';
import { componentConfig } from '@theme/components';
import { typography } from '@theme/typography';

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

  // Content - Variable CSS usada en global.css
  root.style.setProperty('--color-content-bg', componentConfig.Layout.bodyBg);

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
  // CARD - Variables CSS (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente colorBgContainer, colorBorder, borderRadius
  // Solo definimos variables para layout/espaciado
  root.style.setProperty('--card-padding-lg', `${componentConfig.Card.paddingLG}px`);

  // ========================================
  // BUTTON - Variables CSS (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente colorPrimary, borderRadius
  // Solo definimos variables para layout/altura
  root.style.setProperty('--button-height', `${componentConfig.Button.controlHeight}px`);
  root.style.setProperty('--button-height-sm', `${componentConfig.Button.controlHeightSM}px`);
  root.style.setProperty('--button-height-lg', `${componentConfig.Button.controlHeightLG}px`);

  // ========================================
  // SOMBRAS (Desde componentConfig para mantener consistencia)
  // ========================================
  root.style.setProperty('--sombra-sider', componentConfig.Sider.boxShadow);
  root.style.setProperty('--sombra-header', componentConfig.Header.boxShadow);

  // ========================================
  // ESPACIADO (Solo lo necesario para Layout)
  // ========================================
  root.style.setProperty('--spacing-xs', `${allSpacing.marginXS}px`);
  root.style.setProperty('--spacing-sm', `${allSpacing.marginSM}px`);
  root.style.setProperty('--spacing-base', `${allSpacing.margin}px`);
  root.style.setProperty('--spacing-lg', `${allSpacing.marginLG}px`);
  root.style.setProperty('--spacing-xl', `${allSpacing.marginXL}px`);

  // ========================================
  // ALTURAS Y ANCHOS DE LAYOUT
  // ========================================
  root.style.setProperty('--header-height', `${allSpacing.headerHeight}px`);
  root.style.setProperty('--sidebar-width', `${allSpacing.sidebarWidth}px`);
  root.style.setProperty('--sidebar-collapsed-width', `${allSpacing.sidebarCollapsedWidth}px`);

  // Control heights (para botones)
  root.style.setProperty('--control-height', `${allSpacing.controlHeight}px`);
  root.style.setProperty('--control-height-sm', `${allSpacing.controlHeightSM}px`);

  // ========================================
  // LOGO - Tamaños
  // ========================================
  // Logo icono
  root.style.setProperty('--logo-icon-small', `${allSpacing.logoIconSmall}px`);
  root.style.setProperty('--logo-icon-medium', `${allSpacing.logoIconMedium}px`);
  root.style.setProperty('--logo-icon-large', `${allSpacing.logoIconLarge}px`);

  // Logo horizontal
  root.style.setProperty('--logo-horizontal-small-width', `${allSpacing.logoHorizontalSmall}px`);
  root.style.setProperty('--logo-horizontal-small-height', `${allSpacing.logoHorizontalSmallHeight}px`);
  root.style.setProperty('--logo-horizontal-medium-width', `${allSpacing.logoHorizontalMedium}px`);
  root.style.setProperty('--logo-horizontal-medium-height', `${allSpacing.logoHorizontalMediumHeight}px`);
  root.style.setProperty('--logo-horizontal-large-width', `${allSpacing.logoHorizontalLarge}px`);
  root.style.setProperty('--logo-horizontal-large-height', `${allSpacing.logoHorizontalLargeHeight}px`);

  // ========================================
  // Z-INDEX
  // ========================================
  root.style.setProperty('--z-fixed', '1030');

  // ========================================
  // BORDER RADIUS (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente borderRadius desde componentConfig
  // Solo definimos variables para casos específicos de layout
  root.style.setProperty('--border-radius-sm', `${allSpacing.borderRadiusSM}px`);

  // ========================================
  // TIPOGRAFÍA (solo las usadas)
  // ========================================
  // Nota: Ant Design aplica automáticamente fontSize desde componentConfig.Typography
  // Solo definimos variables para casos específicos de layout
  root.style.setProperty('--font-size-base', `${typography.fontSize}px`);
  root.style.setProperty('--font-size-lg', `${typography.fontSizeLG}px`);

  // ========================================
  // TRANSICIONES
  // ========================================
  root.style.setProperty('--transition-base', allSpacing.motionDurationMid);
}
