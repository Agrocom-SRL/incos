/**
 * Helpers de pills para la pantalla "Config. de pagos" (Finanzas). Mismo
 * enfoque que materiaTipoPill / licenciaPills: `StatusPill` + variantes
 * GLOBALES del sistema (`cfg-materia-pill--*`, ver
 * `styles/components/atoms/table-cells.css`). No usa `#hex` ni `fontSize` en JSX.
 */

/** Clase del pill de método de pago en tablas (variante info del sistema global). */
export const CFG_PAGOS_PILL_METODO = 'cfg-materia-pill cfg-materia-pill--info';

/**
 * Pill de porcentaje de una beca/descuento, con variante semántica del sistema
 * (`cfg-materia-pill--*`, table-cells.css) POR RANGO de cobertura:
 *   ≤ 25 % → bajo (neutro) · 26–50 % → medio (info) · 51–75 % → alto (warning)
 *   · > 75 % → total (success).
 */
export const getPorcentajePill = (porcentaje) => {
  if (porcentaje == null) return null;
  const variante =
    porcentaje <= 25 ? 'default' : porcentaje <= 50 ? 'info' : porcentaje <= 75 ? 'warning' : 'success';
  return { label: `${porcentaje}%`, className: `cfg-materia-pill cfg-materia-pill--${variante}` };
};
