// src/styles/theme/css-variables.js
/**
 * Generador de variables CSS desde el tema de Ant Design
 * Este archivo sincroniza las variables CSS con el tema JS
 * 
 * TODAS las variables CSS se generan desde el tema JS (single source of truth)
 * 
 * NOTA: componentColors.js fue eliminado - ahora usamos directamente allColors
 */

import { allColors } from '@config/theme/colors';
import { allSpacing } from '@config/theme/spacing';
import { typography } from '@config/theme/typography';
import { shadows } from '@config/theme/shadows';
import { gradients } from '@config/theme/gradients';
import { accentColors } from '@config/theme/accentColors';

/**
 * Genera TODAS las variables CSS desde el tema JS
 * Se inyecta en el DOM al cargar la aplicación
 */
export function injectCSSVariables() {
  const root = document.documentElement;
  
  // ========================================
  // COLORES PRINCIPALES
  // ========================================
  root.style.setProperty('--color-verde-institucional', allColors.colorPrimary);
  root.style.setProperty('--color-verde-institucional-hover', allColors.colorPrimaryHover);
  root.style.setProperty('--color-verde-institucional-light', allColors.colorPrimaryBorder);
  root.style.setProperty('--color-verde-institucional-lighter', allColors.colorPrimaryBgHover);
  
  root.style.setProperty('--color-verde-cruceno', allColors.colorSuccess);
  root.style.setProperty('--color-verde-cruceno-hover', allColors.colorSuccessHover);
  root.style.setProperty('--color-verde-cruceno-light', allColors.colorSuccessBorder);
  
  // ========================================
  // COLORES DE ACENTO (todos los colores accent)
  // ========================================
  root.style.setProperty('--color-verde-menta', accentColors.colorAccentLime);
  root.style.setProperty('--color-verde-menta-hover', accentColors.colorAccentLimeHover);
  root.style.setProperty('--color-verde-menta-light', accentColors.colorAccentLimeText);
  
  root.style.setProperty('--color-verde-oliva', accentColors.colorAccentTeal);
  root.style.setProperty('--color-verde-oliva-hover', accentColors.colorAccentTealHover);
  root.style.setProperty('--color-verde-oliva-light', accentColors.colorAccentTealText);
  
  root.style.setProperty('--color-accent-red', accentColors.colorAccentRed);
  root.style.setProperty('--color-accent-red-hover', accentColors.colorAccentRedHover);
  root.style.setProperty('--color-accent-orange', accentColors.colorAccentOrange);
  root.style.setProperty('--color-accent-orange-hover', accentColors.colorAccentOrangeHover);
  root.style.setProperty('--color-accent-purple', accentColors.colorAccentPurple);
  root.style.setProperty('--color-accent-purple-hover', accentColors.colorAccentPurpleHover);
  
  root.style.setProperty('--color-azul-cielo', allColors.colorInfo);
  root.style.setProperty('--color-azul-cielo-hover', allColors.colorInfoHover);
  root.style.setProperty('--color-azul-cielo-light', allColors.colorInfoBorder);
  
  root.style.setProperty('--color-dorado', allColors.colorWarning);
  root.style.setProperty('--color-dorado-hover', allColors.colorWarningHover);
  root.style.setProperty('--color-dorado-light', allColors.colorWarningBorder);
  
  root.style.setProperty('--color-rojo-vibrante', allColors.colorError);
  root.style.setProperty('--color-rojo-vibrante-hover', allColors.colorErrorHover);
  root.style.setProperty('--color-rojo-vibrante-light', allColors.colorErrorBorder);
  root.style.setProperty('--color-rojo-oscuro', allColors.colorErrorActive);
  root.style.setProperty('--color-rojo-oscuro-hover', allColors.colorErrorActive);
  
  // ========================================
  // COLORES NEUTROS
  // ========================================
  root.style.setProperty('--color-blanco', allColors.colorBgContainer);
  root.style.setProperty('--color-blanco-suave', allColors.colorBgLayout);
  root.style.setProperty('--color-gris-muy-claro', allColors.colorBgSpotlight);
  root.style.setProperty('--color-gris-claro', allColors.colorBorder);
  root.style.setProperty('--color-gris-medio', allColors.colorTextTertiary);
  root.style.setProperty('--color-gris', allColors.colorTextSecondary);
  root.style.setProperty('--color-gris-oscuro', allColors.colorText);
  root.style.setProperty('--color-negro', '#000000');
  
  // Color para tooltips (oscuro, casi negro)
  root.style.setProperty('--color-tooltip-bg', allColors.colorBgTooltip);
  
  // ========================================
  // COLORES SEMÁNTICOS
  // ========================================
  root.style.setProperty('--color-success', allColors.colorSuccess);
  root.style.setProperty('--color-success-bg', allColors.colorSuccessBg);
  root.style.setProperty('--color-success-border', allColors.colorSuccessBorder);
  
  root.style.setProperty('--color-info', allColors.colorInfo);
  root.style.setProperty('--color-info-bg', allColors.colorInfoBg);
  root.style.setProperty('--color-info-border', allColors.colorInfoBorder);
  
  root.style.setProperty('--color-warning', allColors.colorWarning);
  root.style.setProperty('--color-warning-bg', allColors.colorWarningBg);
  root.style.setProperty('--color-warning-border', allColors.colorWarningBorder);
  
  root.style.setProperty('--color-error', allColors.colorError);
  root.style.setProperty('--color-error-bg', allColors.colorErrorBg);
  root.style.setProperty('--color-error-border', allColors.colorErrorBorder);
  
  // ========================================
  // COLORES POR ROL (usando colores semánticos y accent)
  // ========================================
  root.style.setProperty('--color-admin', allColors.colorError);
  root.style.setProperty('--color-admin-bg', allColors.colorErrorBg);
  
  root.style.setProperty('--color-director', allColors.colorWarning);
  root.style.setProperty('--color-director-bg', allColors.colorWarningBg);
  
  root.style.setProperty('--color-docente', allColors.colorInfo);
  root.style.setProperty('--color-docente-bg', allColors.colorInfoBg);
  
  root.style.setProperty('--color-estudiante', accentColors.colorAccentLime);
  root.style.setProperty('--color-estudiante-bg', accentColors.colorAccentLimeBg);
  
  root.style.setProperty('--color-secretaria', accentColors.colorAccentTeal);
  root.style.setProperty('--color-secretaria-bg', accentColors.colorAccentTealBg);
  
  // ========================================
  // COLORES POR CARRERA
  // ========================================
  root.style.setProperty('--color-carrera-sistemas', allColors.colorInfo);
  root.style.setProperty('--color-carrera-sistemas-bg', allColors.colorInfoBg);
  
  root.style.setProperty('--color-carrera-admin', allColors.colorPrimary);
  root.style.setProperty('--color-carrera-admin-bg', allColors.colorPrimaryBg);
  
  root.style.setProperty('--color-carrera-conta', allColors.colorWarning);
  root.style.setProperty('--color-carrera-conta-bg', allColors.colorWarningBg);
  
  // Avatar Group
  root.style.setProperty('--color-avatar-count-text', allColors.colorWarning);
  root.style.setProperty('--color-avatar-count-bg', allColors.colorWarningBg);
  
  // ========================================
  // COLORES DE COMPONENTES LAYOUT
  // (Usando directamente allColors - eliminamos componentColors.js)
  // ========================================
  root.style.setProperty('--color-sidebar-bg', allColors.colorBgContainer);
  root.style.setProperty('--color-sidebar-active', allColors.colorPrimary);
  root.style.setProperty('--color-sidebar-hover', allColors.colorPrimaryBg);
  root.style.setProperty('--color-sidebar-text', allColors.colorText);
  root.style.setProperty('--color-sidebar-text-active', allColors.colorBgContainer);
  root.style.setProperty('--color-sidebar-border', allColors.colorBorderSecondary);
  root.style.setProperty('--color-sidebar-icon', allColors.colorTextSecondary);
  root.style.setProperty('--color-sidebar-icon-active', allColors.colorBgContainer);
  
  root.style.setProperty('--color-header-bg', allColors.colorPrimary);
  root.style.setProperty('--color-header-text', allColors.colorTextOnDark);
  root.style.setProperty('--color-header-text-secondary', allColors.colorTextSecondaryOnDark);
  root.style.setProperty('--color-header-border', allColors.colorBorderOnDark);
  root.style.setProperty('--color-header-icon', allColors.colorTextOnDark);
  root.style.setProperty('--color-header-icon-hover', allColors.colorTextSecondaryOnDark);
  root.style.setProperty('--color-header-search-bg', allColors.colorBgOnDark);
  root.style.setProperty('--color-header-search-border', allColors.colorBorderSecondaryOnDark);
  
  root.style.setProperty('--color-content-bg', allColors.colorBgLayout);
  root.style.setProperty('--color-content-card-bg', allColors.colorBgContainer);
  root.style.setProperty('--color-content-card-hover', allColors.colorBgContainer);
  root.style.setProperty('--color-content-border', allColors.colorBorder);
  root.style.setProperty('--color-content-text', allColors.colorText);
  root.style.setProperty('--color-content-text-secondary', allColors.colorTextSecondary);
  
  // ========================================
  // TIPOGRAFÍA
  // ========================================
  root.style.setProperty('--font-family-base', typography.fontFamily);
  root.style.setProperty('--font-family-heading', typography.fontFamily);
  root.style.setProperty('--font-family-mono', typography.fontFamilyCode);
  
  root.style.setProperty('--font-size-xs', `${typography.fontSizeSM - 2}px`);
  root.style.setProperty('--font-size-sm', `${typography.fontSizeSM}px`);
  root.style.setProperty('--font-size-base', `${typography.fontSize}px`);
  root.style.setProperty('--font-size-lg', `${typography.fontSizeLG}px`);
  root.style.setProperty('--font-size-xl', `${typography.fontSizeXL}px`);
  root.style.setProperty('--font-size-2xl', `${typography.fontSizeHeading4}px`);
  root.style.setProperty('--font-size-3xl', `${typography.fontSizeHeading3}px`);
  root.style.setProperty('--font-size-4xl', `${typography.fontSizeHeading2}px`);
  root.style.setProperty('--font-size-5xl', `${typography.fontSizeHeading1}px`);
  
  root.style.setProperty('--font-weight-light', '300');
  root.style.setProperty('--font-weight-normal', '400');
  root.style.setProperty('--font-weight-medium', '500');
  root.style.setProperty('--font-weight-semibold', typography.fontWeightStrong.toString());
  root.style.setProperty('--font-weight-bold', '700');
  
  root.style.setProperty('--line-height-tight', typography.lineHeightHeading1.toString());
  root.style.setProperty('--line-height-normal', typography.lineHeight.toString());
  root.style.setProperty('--line-height-relaxed', typography.lineHeightLG.toString());
  
  // ========================================
  // ESPACIADO (Sistema de 4px)
  // ========================================
  root.style.setProperty('--spacing-xs', `${allSpacing.marginXS}px`);
  root.style.setProperty('--spacing-sm', `${allSpacing.marginSM}px`);
  root.style.setProperty('--spacing-md', `${allSpacing.marginMD}px`);
  root.style.setProperty('--spacing-base', `${allSpacing.margin}px`);
  root.style.setProperty('--spacing-lg', `${allSpacing.marginLG}px`);
  root.style.setProperty('--spacing-xl', `${allSpacing.marginXL}px`);
  root.style.setProperty('--spacing-2xl', `${allSpacing.marginXXL}px`);
  root.style.setProperty('--spacing-3xl', '64px');
  
  // ========================================
  // ALTURAS Y ANCHOS DE LAYOUT
  // ========================================
  root.style.setProperty('--header-height', `${allSpacing.headerHeight}px`);
  root.style.setProperty('--footer-height', `${allSpacing.footerHeight}px`);
  root.style.setProperty('--sidebar-width', `${allSpacing.sidebarWidth}px`);
  root.style.setProperty('--sidebar-collapsed-width', `${allSpacing.sidebarCollapsedWidth}px`);
  
  // Control heights (para iconos, botones, etc.)
  root.style.setProperty('--control-height', `${allSpacing.controlHeight}px`);
  root.style.setProperty('--control-height-sm', `${allSpacing.controlHeightSM}px`);
  root.style.setProperty('--control-height-lg', `${allSpacing.controlHeightLG}px`);
  root.style.setProperty('--control-height-xl', `${allSpacing.controlHeightXL}px`);
  root.style.setProperty('--control-height-xs', `${allSpacing.controlHeightXS}px`);
  
  // ========================================
  // BORDES Y RADIOS
  // ========================================
  root.style.setProperty('--radio-sm', `${allSpacing.borderRadiusSM}px`);
  root.style.setProperty('--radio-md', `${allSpacing.borderRadius}px`);
  root.style.setProperty('--radio-lg', `${allSpacing.borderRadiusLG}px`);
  root.style.setProperty('--radio-xl', '16px');
  root.style.setProperty('--radio-full', '9999px');
  
  root.style.setProperty('--border-width', '1px');
  root.style.setProperty('--border-width-md', '2px');
  root.style.setProperty('--border-width-lg', '3px');
  
  // ========================================
  // SOMBRAS
  // ========================================
  root.style.setProperty('--sombra-sm', shadows.shadowElevation1);
  root.style.setProperty('--sombra-md', shadows.shadowElevation2);
  root.style.setProperty('--sombra-lg', shadows.shadowElevation3);
  root.style.setProperty('--sombra-xl', shadows.shadowElevation4);
  root.style.setProperty('--sombra-verde', shadows.shadowPrimary);
  root.style.setProperty('--sombra-azul', `0 4px 12px rgba(125, 155, 220, 0.2)`);
  root.style.setProperty('--sombra-dorado', shadows.shadowGold);
  
  // ========================================
  // GRADIENTES (todos los gradientes, incluyendo accent)
  // ========================================
  root.style.setProperty('--gradiente-institucional', gradients.gradientPrimary);
  root.style.setProperty('--gradiente-azul', gradients.gradientInfo);
  root.style.setProperty('--gradiente-dorado', gradients.gradientGold);
  root.style.setProperty('--gradiente-header', gradients.gradientPrimary);
  root.style.setProperty('--gradiente-card', `linear-gradient(to bottom right, ${allColors.colorPrimary}, ${accentColors.colorAccentLime})`);
  root.style.setProperty('--gradiente-fondo', `linear-gradient(to bottom, ${allColors.colorBgContainer} 0%, ${allColors.colorBgSpotlight} 100%)`);
  
  // Gradientes de acento
  root.style.setProperty('--gradiente-accent-red', gradients.gradientAccentRed);
  root.style.setProperty('--gradiente-accent-orange', gradients.gradientAccentOrange);
  root.style.setProperty('--gradiente-accent-teal', gradients.gradientAccentTeal);
  root.style.setProperty('--gradiente-accent-lime', gradients.gradientAccentLime);
  root.style.setProperty('--gradiente-accent-purple', gradients.gradientAccentPurple);
  
  // Gradientes semánticos
  root.style.setProperty('--gradiente-success', gradients.gradientSuccess);
  root.style.setProperty('--gradiente-error', gradients.gradientError);
  root.style.setProperty('--gradiente-warning', gradients.gradientWarning);
  
  // ========================================
  // Z-INDEX
  // ========================================
  root.style.setProperty('--z-dropdown', allSpacing.zIndexPopupBase.toString());
  root.style.setProperty('--z-sticky', '1020');
  root.style.setProperty('--z-fixed', '1030');
  root.style.setProperty('--z-modal-backdrop', '1040');
  root.style.setProperty('--z-modal', '1050');
  root.style.setProperty('--z-popover', '1060');
  root.style.setProperty('--z-tooltip', '1070');
  
  // ========================================
  // TRANSICIONES
  // ========================================
  root.style.setProperty('--transition-fast', allSpacing.motionDurationFast);
  root.style.setProperty('--transition-base', allSpacing.motionDurationMid);
  root.style.setProperty('--transition-slow', allSpacing.motionDurationSlow);
}
