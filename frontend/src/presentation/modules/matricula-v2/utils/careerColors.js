import { incosColors } from '../theme/incosTheme';

const FALLBACK_PALETTE = [
  '#0d6e3d',
  '#1d4e89',
  '#7a4cb8',
  '#c7522a',
  '#0a8a96',
  '#a16207',
];

const CODIGO_MAP = {
  CG: incosColors.careers['contaduria-general'],
  SI: incosColors.careers['sistemas-informaticos'],
  AE: incosColors.careers.administracion,
  MP: incosColors.careers.marketing,
  SE: incosColors.careers.secretariado,
  EI: incosColors.careers.electronica,
};

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
  return incosColors.brand[600];
}
