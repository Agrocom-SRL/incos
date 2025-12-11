// src/shared/config/theme/spacing.js
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
  sidebarWidth: 256,
  sidebarCollapsedWidth: 80,
};

export const zIndex = {
  zIndexBase: 0,
  zIndexPopupBase: 1000,
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
  ...zIndex,
  ...motion,
  wireframe: false,
};
