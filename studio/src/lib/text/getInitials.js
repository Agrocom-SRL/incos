/**
 * getInitials(name) — iniciales (primera + última palabra) en mayúsculas.
 * Función PURA, sin dependencias. Reutilizable por avatares y chips.
 */
export function getInitials(name) {
  const parts = String(name || 'U').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] || '' : '';
  return (first + last).toUpperCase() || 'U';
}

export default getInitials;
