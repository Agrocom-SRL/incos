// src/shared/config/theme/colors.js
/**
 * Colores principales del sistema
 * Basados en los colores institucionales del logo INCOS
 */

export const primaryColors = {
  colorPrimary: '#196b45',
  colorPrimaryHover: '#134d32',
  colorPrimaryActive: '#0f3a25',
  colorPrimaryBg: '#e8f5e9',
  colorPrimaryBgHover: '#c8e6c9',
  colorPrimaryBorder: '#22854f',
  colorPrimaryBorderHover: '#196b45',
  colorPrimaryText: '#196b45',
  colorPrimaryTextHover: '#134d32',
  colorPrimaryTextActive: '#0f3a25',
};

export const semanticColors = {
  // Color de éxito - Verde cruceño
  colorSuccess: '#06532b',
  colorSuccessHover: '#043d20',
  colorSuccessActive: '#032b16',
  colorSuccessBg: '#e8f5e9',
  colorSuccessBgHover: '#c8e6c9',
  colorSuccessBorder: '#087d3f',
  colorSuccessBorderHover: '#06532b',
  colorSuccessText: '#06532b',

  // Color de información - Azul cielo
  colorInfo: '#7d9bdc',
  colorInfoHover: '#5a78b8',
  colorInfoActive: '#4a6599',
  colorInfoBg: '#e3f2fd',
  colorInfoBgHover: '#bbdefb',
  colorInfoBorder: '#99b1e8',
  colorInfoBorderHover: '#7d9bdc',
  colorInfoText: '#7d9bdc',

  // Color de advertencia - Dorado
  colorWarning: '#f59e0b',
  colorWarningHover: '#d97706',
  colorWarningActive: '#b45309',
  colorWarningBg: '#fef3c7',
  colorWarningBgHover: '#fde68a',
  colorWarningBorder: '#fbbf24',
  colorWarningBorderHover: '#f59e0b',
  colorWarningText: '#f59e0b',

  // Color de error - Rojo vibrante
  colorError: '#e41c24',
  colorErrorHover: '#b81620',
  colorErrorActive: '#8f111a',
  colorErrorBg: '#fee2e2',
  colorErrorBgHover: '#fecaca',
  colorErrorBorder: '#ed4a50',
  colorErrorBorderHover: '#e41c24',
  colorErrorText: '#e41c24',
};

export const linkColors = {
  colorLink: '#196b45',
  colorLinkHover: '#134d32',
  colorLinkActive: '#0f3a25',
};

export const backgroundColors = {
  colorBgContainer: '#ffffff',      // Blanco para Header y Sider
  colorBgElevated: '#ffffff',
  colorBgLayout: '#f5f5f5',         // Gris más oscuro para Content (diferenciarse del blanco)
  colorBgSpotlight: '#f0f0f0',
  colorBgMask: 'rgba(0, 0, 0, 0.45)',
  colorBgTooltip: 'rgba(0, 0, 0, 0.85)', // Color oscuro para tooltips
};

export const textColors = {
  colorText: '#333333',
  colorTextSecondary: '#666666',
  colorTextTertiary: '#999999',
  colorTextQuaternary: '#b6b5b5',
  colorTextDisabled: '#cccccc',
  colorTextPlaceholder: '#b6b5b5',
  colorTextDescription: '#666666',
  colorTextHeading: '#196b45',
};

export const borderColors = {
  colorBorder: '#e8e8e8',
  colorBorderSecondary: '#f0f0f0',
  colorSplit: '#e8e8e8',
};

// Colores para elementos sobre fondos oscuros (Header, etc.)
export const overlayColors = {
  // Texto sobre fondo oscuro
  colorTextOnDark: 'rgba(255, 255, 255, 1)',
  colorTextSecondaryOnDark: 'rgba(255, 255, 255, 0.85)',
  colorTextTertiaryOnDark: 'rgba(255, 255, 255, 0.65)',
  
  // Bordes sobre fondo oscuro
  colorBorderOnDark: 'rgba(255, 255, 255, 0.1)',
  colorBorderSecondaryOnDark: 'rgba(255, 255, 255, 0.2)',
  
  // Fondos semitransparentes sobre oscuro
  colorBgOnDark: 'rgba(255, 255, 255, 0.15)',
  colorBgHoverOnDark: 'rgba(255, 255, 255, 0.25)',
};

export const allColors = {
  ...primaryColors,
  ...semanticColors,
  ...linkColors,
  ...backgroundColors,
  ...textColors,
  ...borderColors,
  ...overlayColors,
};
