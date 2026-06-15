import { categoricalPalette } from '@theme/tokens/colors';

// Paleta categórica global (promovida a @theme/tokens/colors en WS-A).
const PALETTE = categoricalPalette;

/**
 * Iniciales y color para avatar a partir del nombre completo.
 * @param {string} name
 * @returns {{ initials: string, color: string }}
 */
export function avatarFor(name) {
  const safeName = String(name || '');
  const parts = safeName.trim().split(/\s+/);
  const initials =
    ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || '?';
  let h = 0;
  for (let i = 0; i < safeName.length; i += 1) {
    h = (h * 31 + safeName.charCodeAt(i)) >>> 0;
  }
  return { initials, color: PALETTE[h % PALETTE.length] };
}
