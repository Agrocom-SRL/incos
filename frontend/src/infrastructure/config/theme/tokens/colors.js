// src/infrastructure/config/theme/colors.js
/**
 * Colores principales del sistema — ÚNICA fuente literal de la app.
 * Basados en los colores institucionales del logo INCOS (REVAMP §3).
 *
 * ── Single source of truth ───────────────────────────────────────────────────
 * brandScale.light / brandScale.dark alimentan buildAntdTheme y applyThemeVars.
 * Un cambio de verde/modo afecta UN solo lugar (este archivo).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Escala de marca por modo ──────────────────────────────────────────────────
// Los mismos anclajes que brand-tokens.css, consolidados aquí para que JS los
// lea directamente (sin duplicar en buildAntdTheme ni en root.js).
export const brandScale = {
  light: {
    brand50:  '#e3f2ea',
    brand100: '#bfe0cf',
    brand200: '#8ec9ad',
    brand300: '#56ad86',
    brand400: '#1f9163',
    brand500: '#007848',  // colorPrimary — brand.500 AA ≈4.8:1
    brand600: '#006048',  // hover / oscuro
    brand700: '#004830',  // active / headers
    brand800: '#003a26',
    brand900: '#002b1c',
    accentRed:  '#c0282a',
    accentGold: '#b07e10',  // AA ≈4.6:1 como texto sobre blanco
    accentSky:  '#3d6dd0',
    // Semánticos calibrados AA sobre blanco
    success:  '#0e7a39',  // ≈4.6:1
    warning:  '#9a6b00',  // ≈4.6:1
    error:    '#c0282a',
    info:     '#3d6dd0',
    // Superficies
    bgPage:       '#f5f5f5',
    surface:      '#fafcfb',
    surfaceAlt:   '#edf3ef',
    border:       '#c8d6cc',
    text:         '#0a1f15',
    textSecondary:'#566159',
    colorBgContainer: '#fafcfb',
    colorBgElevated:  '#fafcfb',
    colorBgLayout:    '#e8e8e8',
  },
  dark: {
    brand50:  '#0a2218',
    brand100: '#103224',
    brand200: '#16513a',
    brand300: '#1f9163',
    brand400: '#2eae79',
    brand500: '#3fc48d',  // colorPrimary oscuro — más luminoso para dark
    brand600: '#2eae79',
    brand700: '#1f9163',
    brand800: '#16513a',
    brand900: '#103224',
    accentRed:  '#e8625f',
    accentGold: '#e0a82e',  // más vivo sobre fondo oscuro
    accentSky:  '#6f9af0',
    // Semánticos para dark: más vivos (texto sobre fondos oscuros)
    success:  '#16a34a',
    warning:  '#e0a82e',
    error:    '#e8625f',
    info:     '#6f9af0',
    // Superficies
    bgPage:       '#07140e',
    surface:      '#102019',
    surfaceAlt:   '#0c1812',
    border:       '#1d3528',
    text:         '#e8f0ea',
    textSecondary:'#9fb3a7',
    colorBgContainer: '#102019',
    colorBgElevated:  '#16291f',
    colorBgLayout:    '#07140e',
  },
};

// ── Paleta primaria (light, mantenida para retrocompatibilidad con componentConfig) ──
// colorPrimary #007848 pasa contraste AA ≈4.8:1 sobre blanco.
export const primaryColors = {
  colorPrimary: '#007848',         // brand.500 — verde esmeralda INCOS
  colorPrimaryHover: '#006048',    // brand.600
  colorPrimaryActive: '#004830',   // brand.700
  colorPrimaryBg: '#e3f2ea',       // brand.50
  colorPrimaryBgHover: '#bfe0cf',  // brand.100
  colorPrimaryBgDisabled: '#f5f5f5',
  colorPrimaryBorder: '#8ec9ad',   // brand.200
  colorPrimaryBorderHover: '#007848',
  colorPrimaryText: '#007848',     // brand.500
  colorPrimaryTextHover: '#ffffff',
  colorPrimaryTextActive: '#004830',
  colorPrimaryTextDisabled: '#cccccc',
};

export const semanticColors = {
  // Color de éxito — §3, oscurecido a #0e7a39 para pasar AA ≈4.6:1 como texto sobre blanco
  colorSuccess: '#0e7a39',
  colorSuccessHover: '#0f7f38',
  colorSuccessActive: '#0a5c28',
  colorSuccessBg: '#d4ebdc',
  colorSuccessBgHover: '#bfe0cf',
  colorSuccessBgDisabled: '#f5f5f5',
  colorSuccessBorder: '#4db066',
  colorSuccessBorderHover: '#16a34a',
  colorSuccessText: '#0e7a39',
  colorSuccessTextHover: '#ffffff',
  colorSuccessTextDisabled: '#cccccc',

  // Color de información — reanclado a §3 sky #3d6dd0 (AA sobre blanco)
  colorInfo: '#3d6dd0',
  colorInfoHover: '#2f5fb0',
  colorInfoActive: '#234da0',
  colorInfoBg: '#dbeafe',
  colorInfoBgHover: '#bfdbfe',
  colorInfoBgDisabled: '#f5f5f5',
  colorInfoBorder: '#6f9af0',
  colorInfoBorderHover: '#3d6dd0',
  colorInfoText: '#3d6dd0',
  colorInfoTextHover: '#ffffff',
  colorInfoTextDisabled: '#cccccc',

  // Color de advertencia — §3 gold, oscurecido a #9a6b00 para pasar AA ≈4.6:1 como texto sobre blanco
  colorWarning: '#9a6b00',
  colorWarningHover: '#8a6308',
  colorWarningActive: '#644806',
  colorWarningBg: '#fef3c7',
  colorWarningBgHover: '#fde68a',
  colorWarningBgDisabled: '#f5f5f5',
  colorWarningBorder: '#e0a82e',
  colorWarningBorderHover: '#b07e10',
  colorWarningText: '#9a6b00',
  colorWarningTextHover: '#ffffff',
  colorWarningTextDisabled: '#cccccc',

  // Color de error — reanclado a §3 rojo marca #c0282a
  colorError: '#c0282a',
  colorErrorHover: '#9a2022',
  colorErrorActive: '#74181a',
  colorErrorBg: '#fde0de',
  colorErrorBgHover: '#fca5a5',
  colorErrorBgDisabled: '#f5f5f5',
  colorErrorBorder: '#e8625f',
  colorErrorBorderHover: '#c0282a',
  colorErrorText: '#c0282a',
  colorErrorTextHover: '#ffffff',
  colorErrorTextDisabled: '#cccccc',

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
  colorLink: '#007848',     // brand.500
  colorLinkHover: '#006048', // brand.600
  colorLinkActive: '#004830', // brand.700
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
  colorTextHeading: '#007848', // brand.500 (mismo que colorPrimary)
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

// ─────────────────────────────────────────────────────────────────────────────
// Paleta categórica — carreras / avatares (una sola fuente, WS-A §6b).
// Derivada de los acentos de marca (verde · azul · dorado · rojo + análogos).
// Promovida desde matricula-v2/theme/incosTheme.js.
// ─────────────────────────────────────────────────────────────────────────────
/** Paleta de 10 colores para categorías (carreras, avatares). */
export const categoricalPalette = [
  '#006048', // verde marca (brand.600)
  '#3d6dd0', // azul marca (sky §3)
  '#7a4cb8', // violeta
  '#c0282a', // rojo marca
  '#0a8a96', // teal
  '#b07e10', // dorado marca (gold AA)
  '#1f9163', // verde claro (brand.400)
  '#2f5fb0', // azul profundo
  '#9a3f8a', // magenta
  '#5f7c0f', // oliva
];

/**
 * Mapa de color por código de carrera.
 * La clave es el código abreviado (mayúsculas).
 */
export const careerColorMap = {
  CG: '#006048', // Contaduría General
  SI: '#3d6dd0', // Sistemas Informáticos
  AE: '#7a4cb8', // Administración
  MP: '#c0282a', // Marketing
  SE: '#0a8a96', // Secretariado
  EI: '#b07e10', // Electrónica / Informática
};
