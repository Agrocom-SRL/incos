/**
 * Título legible de un curso de capacitación con su edición: «Guaraní · 2027 – 1ª edición».
 * Un mismo curso se oferta varias veces (otra gestión o la misma); la etiqueta de edición
 * distingue las ofertas en listados, tarjetas y fichas. Sin edición devuelve solo el título.
 */
export const tituloConEdicion = (titulo, edicion) =>
  [titulo, edicion].map((parte) => String(parte ?? '').trim()).filter(Boolean).join(' · ');
