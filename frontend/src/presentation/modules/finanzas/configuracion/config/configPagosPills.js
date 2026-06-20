/**
 * Helper de pills de estado (activo/inactivo) para la pantalla "Config. de pagos".
 * Mismo enfoque que materiaTipoPill / licenciaPills: `StatusPill` + clase CSS
 * (estilos en `styles/config-pagos.css`). No usa `#hex` ni `fontSize` en JSX.
 */

/** Etiqueta y clase del pill de estado activo/inactivo. */
export const getActivoPill = (activo) =>
  activo
    ? { label: 'Activo', className: 'cfg-pagos-pill cfg-pagos-pill--activo' }
    : { label: 'Inactivo', className: 'cfg-pagos-pill cfg-pagos-pill--inactivo' };

/** Clase del pill neutro (método/banco asociado, valor de catálogo). */
export const CFG_PAGOS_PILL_NEUTRAL = 'cfg-pagos-pill cfg-pagos-pill--neutral';
