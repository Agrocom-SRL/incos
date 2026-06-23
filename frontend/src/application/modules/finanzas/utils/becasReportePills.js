/**
 * Pills de color (StatusPill) para la planilla de becas por carrera. Reutiliza las
 * clases semánticas `cobranza-pill--*` (buena / aviso / neutra) ya definidas para
 * los reportes de Finanzas, de modo que la cobertura de beca se lee de un vistazo
 * con el MISMO lenguaje de color del resto del módulo.
 *
 * Escala (cobertura de beca por carrera, % de matriculados con beca):
 *   >= 50%  → al-dia (verde: cobertura alta)
 *   > 0%    → proxima (ámbar: cobertura parcial)
 *   0%      → sin (neutro: sin becas en la carrera)
 */

/** Clase de pill para un porcentaje de cobertura/becas por severidad. */
export const getCoberturaPillClass = (porcentaje) => {
  const n = Number(porcentaje) || 0;
  if (n >= 50) return 'cobranza-pill cobranza-pill--al-dia';
  if (n > 0) return 'cobranza-pill cobranza-pill--proxima';
  return 'cobranza-pill cobranza-pill--sin';
};
