/**
 * Tamaños de controles interactivos (px) — única fuente de las dimensiones de
 * chrome (botones de icono, etc.). Se consumen vía var(--size-*); nunca literales.
 *
 *  - control:     tamaño base de un control de icono en puntero fino (mouse).
 *  - touchTarget: mínimo accesible en puntero grueso (touch) — WCAG 2.5.5 (44x44).
 */
export const sizes = {
  control: 38,
  touchTarget: 44,
};

export default sizes;
