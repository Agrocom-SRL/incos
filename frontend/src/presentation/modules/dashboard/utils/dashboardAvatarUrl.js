/**
 * URL de avatar ilustrado (SVG) vía API pública DiceBear.
 * Sustituye emojis en SQL: el seed estable hace el rostro estable por persona/evento.
 *
 * Nota: ilustraciones tipo stock (p. ej. sitios de pago por imagen) requieren licencia;
 * en producción puede sustituirse esta URL por CDN propio o assets licenciados.
 *
 * @param {string} seed - Identificador único (ej. "ESTUDIANTE-12", "DOCENTE-3")
 * @returns {string}
 */
export function dashboardAvatarUrl(seed) {
  const s = encodeURIComponent(String(seed || 'incos').slice(0, 200));
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}&backgroundColor=c0aede`;
}
