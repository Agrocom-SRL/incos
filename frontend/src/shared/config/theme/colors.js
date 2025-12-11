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
  colorPrimaryBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorPrimaryBorder: '#22854f',
  colorPrimaryBorderHover: '#196b45',
  colorPrimaryText: '#196b45',
  colorPrimaryTextHover: '#ffffff', // Blanco en hover
  colorPrimaryTextActive: '#0f3a25',
  colorPrimaryTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
};

export const semanticColors = {
  // Color de éxito - Verde cruceño
  colorSuccess: '#06532b',
  colorSuccessHover: '#043d20',
  colorSuccessActive: '#032b16',
  colorSuccessBg: '#e8f5e9',
  colorSuccessBgHover: '#c8e6c9',
  colorSuccessBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorSuccessBorder: '#087d3f',
  colorSuccessBorderHover: '#06532b',
  colorSuccessText: '#06532b',
  colorSuccessTextHover: '#ffffff', // Blanco en hover
  colorSuccessTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado

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

// Colores de acento complementarios (para elementos decorativos y gradientes)
export const accentColors = {
  // Rojo-Magenta (complementario directo del verde)
  colorAccentRed: '#d81b60',
  colorAccentRedHover: '#c2185b',
  colorAccentRedActive: '#ad1457',
  colorAccentRedBg: '#fce4ec',
  colorAccentRedBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorAccentRedText: '#d81b60',
  colorAccentRedTextHover: '#ffffff', // Blanco en hover
  colorAccentRedTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
  
  // Naranja-Coral (complementario dividido)
  colorAccentOrange: '#ff6b35',
  colorAccentOrangeHover: '#e55a2b',
  colorAccentOrangeActive: '#cc4f26',
  colorAccentOrangeBg: '#fff3e0',
  colorAccentOrangeBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorAccentOrangeText: '#ff6b35',
  colorAccentOrangeTextHover: '#ffffff', // Blanco en hover
  colorAccentOrangeTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
  
  // Azul-Verde (análogo)
  colorAccentTeal: '#2d9cdb',
  colorAccentTealHover: '#2196f3',
  colorAccentTealActive: '#1976d2',
  colorAccentTealBg: '#e0f2f1',
  colorAccentTealBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorAccentTealText: '#2d9cdb',
  colorAccentTealTextHover: '#ffffff', // Blanco en hover
  colorAccentTealTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
  
  // Amarillo-Verde (análogo)
  colorAccentLime: '#6bcf7f',
  colorAccentLimeHover: '#52c41a',
  colorAccentLimeActive: '#389e0d',
  colorAccentLimeBg: '#f6ffed',
  colorAccentLimeBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorAccentLimeText: '#6bcf7f',
  colorAccentLimeTextHover: '#ffffff', // Blanco en hover
  colorAccentLimeTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
  
  // Púrpura-Violeta (triádico)
  colorAccentPurple: '#9d4edd',
  colorAccentPurpleHover: '#7b2cbf',
  colorAccentPurpleActive: '#5a189a',
  colorAccentPurpleBg: '#f3e5f5',
  colorAccentPurpleBgDisabled: '#f5f5f5', // Fondo gris claro cuando está deshabilitado
  colorAccentPurpleText: '#9d4edd',
  colorAccentPurpleTextHover: '#ffffff', // Blanco en hover
  colorAccentPurpleTextDisabled: '#cccccc', // Texto gris cuando está deshabilitado
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
