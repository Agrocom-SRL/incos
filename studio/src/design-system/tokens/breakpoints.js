/**
 * Escala única de breakpoints del design-system (fuente de verdad documentada).
 *
 * Estos valores son la referencia canónica para TODO punto de quiebre responsive
 * del studio: tanto `@media` (decisiones de viewport, p. ej. el drawer del sidebar
 * que es `position: fixed` al window) como `@container` (reflow interno de grids,
 * que reaccionan al ancho real del content, no al viewport).
 *
 * IMPORTANTE — por qué los `.css` repiten los números:
 * CSS no puede leer custom properties (`var(--…)`) dentro de la condición de un
 * `@container`/`@media` (las queries se evalúan antes de resolver variables). Por
 * eso los archivos `.css` escriben el número literalmente; pero ese número DEBE
 * pertenecer SIEMPRE a esta escala. Prohibido inventar breakpoints sueltos como
 * 1199 / 639 / 575: si un grid necesita quebrar "antes de desktop", usa `lg` (1024);
 * "en móvil", usa `sm` (640) o `md` (768). Un valor no vive en dos sitios: la escala
 * vive aquí, y los `.css` la consumen por convención (comentando el token que usan).
 *
 * @typedef {Object} Breakpoints
 * @property {number} xs  480 — móvil pequeño
 * @property {number} sm  640 — móvil grande
 * @property {number} md  768 — tablet / umbral del drawer (viewport)
 * @property {number} lg  1024 — desktop angosto / content estrecho con sidebar expandido
 * @property {number} xl  1280 — desktop amplio
 */
export const breakpoints = { xs: 480, sm: 640, md: 768, lg: 1024, xl: 1280 };
