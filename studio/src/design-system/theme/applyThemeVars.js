/**
 * applyThemeVars(mode) — escribe TODAS las variables CSS del design-system en :root.
 *
 * Responsabilidad ÚNICA: proyectar los tokens JS (paleta + primitivos) a CSS vars.
 * Idempotente y simétrico: el mismo set de vars se escribe para light y dark desde
 * `palette[mode]`, SIN ningún `if (mode)` para casos especiales. Declarar la paleta
 * cambia todo el sistema. Marca `data-theme` en <html> para `color-scheme`.
 *
 * Es el contrato visual con el CSS: los componentes consumen var(--…), nunca literales.
 */
import { activeBrand } from '@config/brand';
import { buildPalette, motion, spacing, sizes, radii, typography, shadows, zIndex } from '@ds/tokens';

const palette = buildPalette(activeBrand);

function set(root, name, value) {
  root.style.setProperty(name, value);
}

export function applyThemeVars(mode = 'light') {
  const root = document.documentElement;
  const p = palette[mode] ?? palette.light;
  const sh = shadows[mode] ?? shadows.light;

  root.setAttribute('data-theme', mode);

  // ── Marca (rampa + acentos) ──────────────────────────────────────────────
  Object.entries(p.brand).forEach(([k, v]) => set(root, `--brand-${k}`, v));
  // Acentos: itera el set completo del modo (red/gold/sky/teal/violet/orange/pink/lime)
  // → emite --accent-<nombre> sin hardcodear cada uno.
  Object.entries(p.accent).forEach(([k, v]) => set(root, `--accent-${k}`, v));

  // ── Paleta categórica (carreras/gráficos) → --cat-0 … --cat-11 ───────────
  p.categorical.forEach((v, i) => set(root, `--cat-${i}`, v));

  // ── Superficies / texto / borde ──────────────────────────────────────────
  set(root, '--bg-page', p.surface.bgPage);
  set(root, '--bg-page-2', p.surface.bgPage2);
  set(root, '--surface-chrome', p.surface.chrome);
  set(root, '--chrome-input-bg', p.surface.chromeInputBg);
  set(root, '--surface', p.surface.base);
  set(root, '--surface-alt', p.surface.alt);
  set(root, '--surface-hover', p.surface.hover);
  set(root, '--text', p.text.strong);
  set(root, '--text-2', p.text.secondary);
  set(root, '--text-muted', p.text.muted);
  set(root, '--text-soft', p.text.soft);
  set(root, '--border', p.border.base);
  set(root, '--border-strong', p.border.strong);
  set(root, '--divider', p.border.divider);

  // ── Estado (semántico + pills) ───────────────────────────────────────────
  set(root, '--success', p.semantic.success);
  set(root, '--warning', p.semantic.warning);
  set(root, '--danger', p.semantic.danger);
  set(root, '--info', p.semantic.info);
  Object.entries(p.pill).forEach(([k, v]) => {
    const name = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    set(root, `--pill-${name}`, v);
  });

  // ── Navegación / tooltip ─────────────────────────────────────────────────
  set(root, '--nav-item-fg', p.nav.itemFg);
  set(root, '--nav-item-hover-bg', p.nav.itemHoverBg);
  set(root, '--nav-item-active-bg', p.nav.activeBg);
  set(root, '--nav-item-active-fg', p.nav.activeFg);
  set(root, '--nav-item-active-border', p.nav.activeBorder);
  set(root, '--nav-item-active-bar', p.nav.activeBar);
  set(root, '--nav-item-active-shadow', p.nav.activeShadow);
  set(root, '--tooltip-bg', p.tooltip.bg);
  set(root, '--tooltip-fg', p.tooltip.fg);
  set(root, '--tooltip-border', p.tooltip.border);

  // ── Roles auxiliares (texto sobre acento, velo modal) ─────────────────────
  set(root, '--color-on-accent', p.misc.onAccent);
  set(root, '--color-on-accent-soft', p.misc.onAccentSoft);
  set(root, '--backdrop', p.misc.backdrop);

  // ── Sombras ──────────────────────────────────────────────────────────────
  set(root, '--shadow-sm', sh.sm);
  set(root, '--shadow', sh.base);
  set(root, '--shadow-md', sh.md);
  set(root, '--shadow-lg', sh.lg);

  // ── Primitivos invariantes (mismos en ambos modos, idempotentes) ─────────
  set(root, '--font-family', activeBrand.fontFamily);
  Object.entries(typography.size).forEach(([k, v]) => set(root, `--font-size-${k}`, `${v}px`));
  Object.entries(typography.weight).forEach(([k, v]) => set(root, `--font-weight-${k}`, `${v}`));
  Object.entries(typography.lineHeight).forEach(([k, v]) => set(root, `--line-height-${k}`, `${v}`));
  Object.entries(spacing).forEach(([k, v]) => set(root, `--space-${k}`, `${v}px`));
  Object.entries(sizes).forEach(([k, v]) => {
    const name = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    set(root, `--size-${name}`, `${v}px`);
  });
  Object.entries(radii).forEach(([k, v]) => set(root, `--radius-${k}`, `${v}px`));
  Object.entries(zIndex).forEach(([k, v]) => set(root, `--z-${k}`, `${v}`));
  set(root, '--ease-out', motion.ease.out);
  set(root, '--ease-in-out', motion.ease.inOut);
  set(root, '--ease-drawer', motion.ease.drawer);
  Object.entries(motion.dur).forEach(([k, v]) => set(root, `--dur-${k}`, `${v}ms`));
}

export default applyThemeVars;
