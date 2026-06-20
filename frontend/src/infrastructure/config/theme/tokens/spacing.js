// src/infrastructure/config/theme/spacing.js
/**
 * Configuración de espaciado y sizing
 */

export const spacing = {
  marginXS: 4,
  marginSM: 10,
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
  // Alineado a 65px (= topbarHeight mv2 aprobado) para fidelidad visual.
  headerHeight: 65,
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

// Espaciado específico de la navegación / chrome del shell
// Todos los valores igualan a matricula-v2 (mv2) para fidelidad visual.
export const navSpacing = {
  navItemGap: 12,           // gap icono↔label (.sidebar-item)
  navItemPadY: 10,          // padding vertical ítem de menú
  navItemPadX: 14,          // padding horizontal ítem de menú
  navItemRadius: 10,        // border-radius ítem (= mv2)
  navItemMarginY: 2,        // margin vertical ítem (2px 10px)
  navItemMarginX: 10,       // margin horizontal ítem
  navSubIndent: 44,         // paddingLeft sub-item nivel 2
  navSectionLabelPadX: 24,  // padding lateral section-label
  navSectionLabelPadB: 6,   // padding bottom section-label
  topbarHeight: 65,         // altura del topbar (mv2: 65px vs legacy 64px)
  topbarPadX: 28,           // padding horizontal topbar
  topbarGap: 20,            // gap entre zonas del topbar
  topbarSearchMax: 460,     // max-width del buscador
  topbarUtilGap: 2,         // gap entre botones-icono utilities
  topbarEndGap: 4,          // gap zona __end (utilities + perfil)
  chromeControl: 36,        // alto/ancho de controles del chrome (36px)
  sidebarLogoMinH: 56,      // min-height del área del logo en sidebar
};

/**
 * Tokens de motion JS — alineados con brand-tokens.css y presentation/motion/presets.js.
 * ANTES divergían (motionEaseOut era cubic-bezier(0,0,0.2,1) vs --ease-out cubic-bezier(0.23,1,0.32,1)).
 * AHORA: fuente única. --transition-base = motionDurationMid = 0.16s (--dur-hover).
 * Cualquier cambio aquí debe reflejarse en presets.js y brand-tokens.css (y viceversa).
 */
export const motion = {
  /** press: 140ms = --dur-press */
  motionDurationFast: '0.14s',
  /** hover: 160ms = --dur-hover → --transition-base */
  motionDurationMid: '0.16s',
  /** pop: 200ms = --dur-pop */
  motionDurationSlow: '0.20s',
  /** = --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1) */
  motionEaseInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  /** = --ease-out: cubic-bezier(0.23, 1, 0.32, 1) */
  motionEaseOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** = --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1) */
  motionEaseIn: 'cubic-bezier(0.32, 0.72, 0, 1)',
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
  ...navSpacing,
  wireframe: false,
};
