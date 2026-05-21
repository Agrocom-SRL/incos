/** Fallback: default institucional de notaMinimaAprobacion (gestión sin fila configurada). */
export const NOTA_MINIMA_APROBACION_DEFAULT = 61;

export const resolverNotaMinimaAprobacion = (politica) => {
  const n = Number(politica?.notaMinimaAprobacion);
  return Number.isFinite(n) ? n : NOTA_MINIMA_APROBACION_DEFAULT;
};
