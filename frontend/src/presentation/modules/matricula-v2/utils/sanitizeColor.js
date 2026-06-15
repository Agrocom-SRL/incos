/**
 * Sanitiza un color de negocio (hex de seeders/BD) antes de inyectarlo inline.
 * Única vía permitida para color dinámico (§1 incos-ui-system). Acepta valores
 * de tema (`var(--...)`) tal cual; valida hex de 3/6/8 dígitos; si no, devuelve
 * el fallback de marca.
 * @param {string|null|undefined} raw
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeBusinessColor(raw, fallback = 'var(--brand-600)') {
  if (raw == null || raw === '') return fallback;
  const s = String(raw).trim();
  if (s.startsWith('var(') || s.startsWith('color-mix(')) return s;
  if (/^#?[0-9a-f]{3}$/i.test(s) || /^#?[0-9a-f]{6}$/i.test(s) || /^#?[0-9a-f]{8}$/i.test(s)) {
    return s.startsWith('#') ? s : `#${s}`;
  }
  return fallback;
}

export default sanitizeBusinessColor;
