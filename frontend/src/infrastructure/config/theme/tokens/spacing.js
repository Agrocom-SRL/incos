// src/infrastructure/config/theme/spacing.js
/**
 * Configuración de espaciado y sizing
 */

export const spacing = {
  marginXS: 4,
  marginSM: 8,
  margin: 16,
  marginMD: 20,
  marginLG: 24,
  marginXL: 32,
  marginXXL: 48,
  paddingXS: 4,
  paddingSM: 8,
  padding: 16,
  paddingMD: 20,
  paddingLG: 24,
  paddingXL: 32,
  sizeStep: 4,
  sizeUnit: 4,
};

export const borderRadius = {
  borderRadius: 8,
  borderRadiusMD: 10,
  borderRadiusLG: 12,
  borderRadiusSM: 4,
  borderRadiusXS: 2,
};

export const controlHeights = {
  controlHeight: 40,
  controlHeightSM: 32,
  controlHeightLG: 48,
  controlHeightXL: 64,
  controlHeightXS: 24,
};

// Alturas de componentes layout
export const layoutHeights = {
  headerHeight: 64,
  footerHeight: 48,
  sidebarWidth: 274,
  sidebarCollapsedWidth: 80,
};

// Tamaños del logo
export const logoSizes = {
  // Logo icono (cuadrado)
  logoIconSmall: 32,
  logoIconMedium: 40,
  logoIconLarge: 48,
  // Logo horizontal
  logoHorizontalSmall: 100,
  logoHorizontalSmallHeight: 32,
  logoHorizontalMedium: 140,
  logoHorizontalMediumHeight: 48,
  logoHorizontalLarge: 220,
  logoHorizontalLargeHeight: 64,
};

// Anchos de modal (estructura, no estilo): consumidos vía prop `width` de AntD Modal.
export const modalWidths = {
  modalWidthSM: 420,
  modalWidth: 520,
  modalWidthLG: 720,
};

export const zIndex = {
  zIndexBase: 0,
  zIndexPopupBase: 1000,
};

// Tamaños para Skeleton (Loading Fallback)
export const skeletonSizes = {
  skeletonTitleWidth: 300,
  skeletonTitleHeight: 32,
  skeletonCardWidth: 300,
  skeletonCardHeight: 200,
};

export const motion = {
  motionDurationFast: '0.15s',
  motionDurationMid: '0.2s',
  motionDurationSlow: '0.3s',
  motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  motionEaseOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
};

export const allSpacing = {
  ...spacing,
  ...borderRadius,
  ...controlHeights,
  ...layoutHeights,
  ...logoSizes,
  ...modalWidths,
  ...zIndex,
  ...motion,
  ...skeletonSizes,
  wireframe: false,
};
