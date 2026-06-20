/**
 * Paleta semántica por modo, derivada de la marca activa.
 *
 * Responsabilidad ÚNICA: traducir la rampa/acentos de un `brand` a un conjunto
 * COMPLETO y SIMÉTRICO de roles semánticos (superficie, texto, borde, estado, nav,
 * tooltip) para light y dark. El theme escribe estos roles como CSS vars sin ningún
 * `if (mode)`: declarar la paleta → cambia todo.
 *
 * Las superficies/estados son los valores por defecto del tema (fieles a §3 REVAMP);
 * la marca inyecta su rampa y acentos. Otro tenant cambia `brand` y hereda esta
 * estructura. nav/tooltip referencian var(--brand-N) (que el theme también emite),
 * así un cambio de rampa se propaga sin recalcular aquí.
 */
import { categoricalFor } from './categorical';

const SURFACES = {
  light: {
    bgPage: '#e6ece8',
    bgPage2: '#d8e3dc',
    chrome: '#fafcfb',
    chromeInputBg: '#e4ebe6',
    base: '#fafcfb',
    alt: '#edf3ef',
    hover: '#e2ede6',
  },
  dark: {
    bgPage: '#07140e',
    bgPage2: '#0a1d14',
    chrome: '#0c1812',
    chromeInputBg: '#0f2118',
    base: '#102019',
    alt: '#0c1812',
    hover: '#15291f',
  },
};

const TEXT = {
  light: { strong: '#0a1f15', secondary: '#2a3a32', muted: '#566159', soft: '#6e7a72' },
  dark: { strong: '#e8f0ea', secondary: '#c5d4cb', muted: '#9fb3a7', soft: '#7e948a' },
};

const BORDER = {
  light: { base: '#c8d6cc', strong: '#b3c5b9', divider: '#d8e4dc' },
  dark: { base: '#1d3528', strong: '#2a4838', divider: '#172a20' },
};

const SEMANTIC = {
  light: { success: '#16a34a', warning: '#8a6308', danger: '#c0282a', info: '#3d6dd0' },
  dark: { success: '#34d399', warning: '#fbbf24', danger: '#f87171', info: '#60a5fa' },
};

const PILL = {
  light: {
    warnBg: '#fef3c7', warnFg: '#92400e',
    okBg: '#d4ebdc', okFg: '#0a4f2d',
    errBg: '#fde0de', errFg: '#8a1a18',
    infoBg: '#dbeafe', infoFg: '#1e3a8a',
    neutralBg: '#eef2f0', neutralFg: '#566159',
  },
  dark: {
    warnBg: '#3a2810', warnFg: '#fbbf24',
    okBg: '#103820', okFg: '#5dd3a0',
    errBg: '#3a1818', errFg: '#fca5a5',
    infoBg: '#15294a', infoFg: '#aecbff',
    neutralBg: '#15291f', neutralFg: '#9fb3a7',
  },
};

const NAV = {
  light: {
    itemFg: 'var(--text-2)',
    itemHoverBg: 'color-mix(in srgb, var(--brand-600) 17%, transparent)',
    activeBg: 'var(--brand-50)',
    activeFg: 'var(--brand-700)',
    activeBorder: 'var(--brand-400)',
    activeBar: 'var(--brand-500)',
    activeShadow: '0 1px 4px rgba(0, 72, 48, 0.12)',
  },
  dark: {
    itemFg: 'var(--text-2)',
    itemHoverBg: 'color-mix(in srgb, var(--brand-500) 18%, transparent)',
    activeBg: 'var(--brand-200)',
    activeFg: '#86e3b3',
    activeBorder: 'var(--brand-600)',
    activeBar: 'var(--brand-500)',
    activeShadow: '0 1px 6px rgba(0, 0, 0, 0.35)',
  },
};

const TOOLTIP = {
  light: { bg: 'var(--brand-700)', fg: '#f0f5f2', border: 'var(--brand-400)' },
  dark: { bg: 'var(--brand-200)', fg: '#e8f0ea', border: 'var(--brand-600)' },
};

// Roles auxiliares: texto/relleno sobre superficies de acento y velo modal.
// `onAccent` es el color del texto/glifo encima de un acento o `--cat-N` (chip activo,
// icono de KpiCard). DEPENDE DEL MODO porque los acentos cambian de luminosidad:
//   - LIGHT: acentos saturados/oscuros → texto BLANCO encima (≥4.5:1 garantizado por
//     los acentos oscurecidos en incos.brand.js).
//   - DARK: acentos luminosos → texto OSCURO encima (TEXT.light.strong = #0a1f15),
//     que da ≥4.5:1 sobre cada acento/categórico claro; el blanco se quemaría (<3:1).
// No es un `if (mode)` en componente: el contraste se resuelve por modo en el token.
const MISC = {
  light: {
    onAccent: '#ffffff',
    onAccentSoft: 'rgba(255, 255, 255, 0.25)',
    backdrop: 'rgba(5, 20, 12, 0.45)',
  },
  dark: {
    onAccent: TEXT.light.strong, // #0a1f15 — texto oscuro sobre acentos luminosos
    onAccentSoft: 'rgba(10, 31, 21, 0.22)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },
};

function paletteForMode(brand, mode) {
  return {
    brand: brand.ramp[mode],
    accent: brand.accents[mode],
    surface: SURFACES[mode],
    text: TEXT[mode],
    border: BORDER[mode],
    semantic: SEMANTIC[mode],
    pill: PILL[mode],
    nav: NAV[mode],
    tooltip: TOOLTIP[mode],
    misc: MISC[mode],
    categorical: categoricalFor(mode),
  };
}

/**
 * @param {import('@config/brand').incosBrand} brand
 * @returns {{ light: object, dark: object }}
 */
export function buildPalette(brand) {
  return {
    light: paletteForMode(brand, 'light'),
    dark: paletteForMode(brand, 'dark'),
  };
}

export default buildPalette;
