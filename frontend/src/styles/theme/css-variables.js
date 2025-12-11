// src/styles/theme/css-variables.js
/**
 * Generador de variables CSS desde el tema de Ant Design
 * Este archivo sincroniza las variables CSS con el tema JS
 * 
 * TODAS las variables CSS se generan desde el tema JS (single source of truth)
 * 
 * FASE 1: Solo variables esenciales para Layout, Header, Sider, Content y Button
 */

import { allSpacing } from '@config/theme/spacing';
import { shadows } from '@config/theme/shadows';
import { componentConfig } from '@config/theme/components';

/**
 * Genera TODAS las variables CSS desde el tema JS
 * Se inyecta en el DOM al cargar la aplicación
 */
export function injectCSSVariables() {
  const root = document.documentElement;

  // ========================================
  // COLORES DE COMPONENTES LAYOUT
  // (Usando componentConfig para que vengan del tema de Ant Design)
  // ========================================

  // Layout - Configuración general desde componentConfig.Layout
  root.style.setProperty('--color-layout-sider-bg', componentConfig.Layout.siderBg);
  root.style.setProperty('--color-layout-header-bg', componentConfig.Layout.headerBg);
  root.style.setProperty('--color-layout-body-bg', componentConfig.Layout.bodyBg);

  // Sider - Variables CSS para componentes personalizados
  root.style.setProperty('--color-sidebar-bg', componentConfig.Layout.siderBg);
  root.style.setProperty('--color-sidebar-text', componentConfig.Sider.colorText);
  root.style.setProperty('--color-sidebar-text-secondary', componentConfig.Sider.colorTextSecondary);
  root.style.setProperty('--color-sidebar-border', componentConfig.Sider.colorBorder);

  // Header - Configuración desde componentConfig.Header
  root.style.setProperty('--color-header-bg', componentConfig.Header.colorBgContainer);
  root.style.setProperty('--color-header-text', componentConfig.Header.colorText);
  root.style.setProperty('--color-header-text-secondary', componentConfig.Header.colorTextSecondary);
  root.style.setProperty('--color-header-border', componentConfig.Header.colorBorder);

  // Content - Variables CSS desde componentConfig.Layout
  root.style.setProperty('--color-content-bg', componentConfig.Layout.bodyBg);

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
  // Z-INDEX
  // ========================================
  root.style.setProperty('--z-fixed', '1030');

  // ========================================
  // TRANSICIONES
  // ========================================
  root.style.setProperty('--transition-base', allSpacing.motionDurationMid);
}
