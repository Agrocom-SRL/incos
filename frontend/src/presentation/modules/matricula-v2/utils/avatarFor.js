const PALETTE = [
  '#0d6e3d',
  '#157347',
  '#1d4e89',
  '#7a4cb8',
  '#c7522a',
  '#0a8a96',
  '#a16207',
  '#b91c1c',
  '#0369a1',
  '#4d7c0f',
];

/**
 * Iniciales y color para avatar a partir del nombre completo.
 * @param {string} name
 * @returns {{ initials: string, color: string }}
 */
export function avatarFor(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/);
  const initials =
    ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase() || '?';
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return { initials, color: PALETTE[h % PALETTE.length] };
}
