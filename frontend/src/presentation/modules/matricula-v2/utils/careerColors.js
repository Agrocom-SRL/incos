import { categoricalPalette, careerColorMap, primaryColors } from '@theme/tokens/colors';

// Paleta categórica global y mapa de carreras promovidos a @theme/tokens/colors en WS-A.
const FALLBACK_PALETTE = categoricalPalette;
const CODIGO_MAP = careerColorMap;

/**
 * Color de carrera: API (colorHex) → código → hash por id.
 * @param {{ id?: number|string, codigo?: string, nombre?: string, colorHex?: string }} carrera
 */
export function resolveCareerColor(carrera) {
  const hex = carrera?.colorHex || carrera?.color_hex;
  if (hex && /^#?[0-9a-f]{3,8}$/i.test(hex)) {
    return hex.startsWith('#') ? hex : `#${hex}`;
  }
  const codigo = String(carrera?.codigo ?? '').toUpperCase();
  if (CODIGO_MAP[codigo]) return CODIGO_MAP[codigo];
  const id = Number(carrera?.id);
  if (!Number.isNaN(id) && id > 0) {
    return FALLBACK_PALETTE[id % FALLBACK_PALETTE.length];
  }
  // Fallback: brand.600 del sistema global
  return primaryColors.colorPrimaryHover;
}
