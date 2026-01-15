// src/infrastructure/config/theme/colors.js
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
  colorPrimaryBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorPrimaryBorder: '#22854f',
  colorPrimaryBorderHover: '#196b45',
  colorPrimaryText: '#196b45',
  colorPrimaryTextHover: '#ffffff', // Blanco en hover
  colorPrimaryTextActive: '#0f3a25',
  colorPrimaryTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
};

export const semanticColors = {
  // Color de éxito - Verde medio del logo 
  colorSuccess: '#399f53',
  colorSuccessHover: '#2d7f42',
  colorSuccessActive: '#235f32',
  colorSuccessBg: '#f0f7ef',
  colorSuccessBgHover: '#e0efe5',
  colorSuccessBgDisabled: '#f5f5f5',
  colorSuccessBorder: '#4db066',
  colorSuccessBorderHover: '#399f53',
  colorSuccessText: '#399f53',
  colorSuccessTextHover: '#ffffff',
  colorSuccessTextDisabled: '#cccccc',

  // Color de información - Azul cielo
  colorInfo: '#7d9bdc',
  colorInfoHover: '#5a78b8',
  colorInfoActive: '#4a6599',
  colorInfoBg: '#e3f2fd',
  colorInfoBgHover: '#bbdefb',
  colorInfoBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorInfoBorder: '#99b1e8',
  colorInfoBorderHover: '#7d9bdc',
  colorInfoText: '#7d9bdc',
  colorInfoTextHover: '#ffffff', // Blanco en hover
  colorInfoTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado

  // Color de advertencia - Dorado
  colorWarning: '#f59e0b',
  colorWarningHover: '#d97706',
  colorWarningActive: '#b45309',
  colorWarningBg: '#fef3c7',
  colorWarningBgHover: '#fde68a',
  colorWarningBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorWarningBorder: '#fbbf24',
  colorWarningBorderHover: '#f59e0b',
  colorWarningText: '#f59e0b',
  colorWarningTextHover: '#ffffff', // Blanco en hover
  colorWarningTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado

  // Color de error - Rojo vibrante
  colorError: '#e41c24',
  colorErrorHover: '#b81620',
  colorErrorActive: '#8f111a',
  colorErrorBg: '#fee2e2',
  colorErrorBgHover: '#fecaca',
  colorErrorBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorErrorBorder: '#ed4a50',
  colorErrorBorderHover: '#e41c24',
  colorErrorText: '#e41c24',
  colorErrorTextHover: '#ffffff', // Blanco en hover
  colorErrorTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado

  // Color de acento - Púrpura/Violeta (para destacar secciones importantes)
  colorAccent: '#8b5cf6',
  colorAccentHover: '#7c3aed',
  colorAccentActive: '#6d28d9',
  colorAccentBg: '#f3e8ff',
  colorAccentBgHover: '#e9d5ff',
  colorAccentBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorAccentBorder: '#a78bfa',
  colorAccentBorderHover: '#8b5cf6',
  colorAccentText: '#8b5cf6',
  colorAccentTextHover: '#ffffff', // Blanco en hover
  colorAccentTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
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

// Colores para elementos sobre fondos oscuros/gradientes
// Se mantienen para el tema claro porque se usan en cards con gradientes oscuros
// (por ejemplo, OrdersSummaryCard y StudentsSummaryCard con gradientes verdes)
export const overlayColors = {
  // Color blanco puro (para texto sobre fondos primarios, estados activos, etc.)
  colorWhite: '#ffffff',
  
  // Texto sobre fondo oscuro/gradiente
  colorTextOnDark: 'rgba(255, 255, 255, 1)',
  colorTextSecondaryOnDark: 'rgba(255, 255, 255, 0.85)',
  colorTextTertiaryOnDark: 'rgba(255, 255, 255, 0.65)',
  
  // Bordes sobre fondo oscuro/gradiente
  colorBorderOnDark: 'rgba(255, 255, 255, 0.1)',
  colorBorderSecondaryOnDark: 'rgba(255, 255, 255, 0.2)',
  
  // Fondos semitransparentes sobre oscuro/gradiente
  colorBgOnDark: 'rgba(255, 255, 255, 0.15)',
  colorBgHoverOnDark: 'rgba(255, 255, 255, 0.25)',
};

// Colores de acento extraídos del logo INCOS
// Solo se mantienen colores únicos que no duplican semanticColors
// Eliminados: Blue (duplica Info), Red (duplica Error), Green (duplica Success)
export const accentColors = {
  // Amarillo/Beige claro del logo - ÚNICO
  colorAccentBeige: '#e2dba0',
  colorAccentBeigeHover: '#c9c186',
  colorAccentBeigeActive: '#b0a76d',
  colorAccentBeigeBg: '#faf9f0',
  colorAccentBeigeBgDisabled: '#f5f5f5',
  colorAccentBeigeBorder: '#d4ca8a',
  colorAccentBeigeBorderHover: '#e2dba0',
  colorAccentBeigeText: '#8b8253',
  colorAccentBeigeTextHover: '#ffffff',
  colorAccentBeigeTextDisabled: '#cccccc',
  
  // Verde oliva/amarillo verdoso del logo - ÚNICO
  colorAccentOlive: '#878c49',
  colorAccentOliveHover: '#6b6f3a',
  colorAccentOliveActive: '#56592e',
  colorAccentOliveBg: '#f1f2e4',
  colorAccentOliveBgDisabled: '#f5f5f5',
  colorAccentOliveBorder: '#9fa45a',
  colorAccentOliveBorderHover: '#878c49',
  colorAccentOliveText: '#878c49',
  colorAccentOliveTextHover: '#ffffff',
  colorAccentOliveTextDisabled: '#cccccc',
  
  // Marrón oscuro/Negro del logo - ÚNICO
  colorAccentBrown: '#381110',
  colorAccentBrownHover: '#2a0c0c',
  colorAccentBrownActive: '#1d0808',
  colorAccentBrownBg: '#e8e5e5',
  colorAccentBrownBgDisabled: '#f5f5f5',
  colorAccentBrownBorder: '#4a1a1a',
  colorAccentBrownBorderHover: '#381110',
  colorAccentBrownText: '#381110',
  colorAccentBrownTextHover: '#ffffff',
  colorAccentBrownTextDisabled: '#cccccc',
  
  // Verde claro del logo - ÚNICO (diferente de Success)
  colorAccentGreenLight: '#a4c79e',
  colorAccentGreenLightHover: '#85b27a',
  colorAccentGreenLightActive: '#6b9d5f',
  colorAccentGreenLightBg: '#f0f7ef',
  colorAccentGreenLightBgDisabled: '#f5f5f5',
  colorAccentGreenLightBorder: '#b8d6b1',
  colorAccentGreenLightBorderHover: '#a4c79e',
  colorAccentGreenLightText: '#6b9d5f',
  colorAccentGreenLightTextHover: '#ffffff',
  colorAccentGreenLightTextDisabled: '#cccccc',
};

export const allColors = {
  ...primaryColors,
  ...semanticColors,
  ...linkColors,
  ...backgroundColors,
  ...textColors,
  ...borderColors,
  ...overlayColors,
  ...accentColors,
};
