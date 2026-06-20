/**
 * Paleta categórica — colores distinguibles para categorías (carreras, avatares,
 * gráficos). Independiente de la rampa de marca: su rol es DIFERENCIAR, no marcar.
 * Centralizada aquí (no en features) para que el mapeo de dominio consuma tokens.
 *
 * Por modo (light/dark) y simétrica. **Los índices 0–5 mapean las carreras**
 * (ver `careerColor.js` → CAREER_INDEX = { CG:0, SI:1, AE:2, MP:3, SE:4, EI:5 }):
 *   0 = CG (verde marca) · 1 = SI (azul/sky) · 2 = AE (violeta) ·
 *   3 = MP (rojo) · 4 = SE (teal) · 5 = EI (dorado).
 * Los índices 6–11 son extras distinguibles para más categorías o gráficos.
 *
 * Se DERIVA de `incosBrand` (ramp + accents) para no divergir de la marca: cambiar
 * la marca recolorea las categorías. El theme emite cada color como `--cat-N` por
 * modo, así el color de carrera es theme-aware sin `if (mode)`.
 */
import { incosBrand } from '@config/brand/incos.brand';

const { ramp, accents } = incosBrand;

/**
 * Verdes extra (slots 6/10/11) cuyo tono AA-válido difiere por modo: cada `--cat-N`
 * se usa como FONDO de chip activo (texto `--color-on-accent` encima) → necesita ≥4.5:1.
 * En light el on-accent es blanco (hace falta verde OSCURO); en dark es texto oscuro
 * (hace falta verde CLARO). La rampa por sí sola no cubre ambos en un mismo índice
 * (p. ej. dark r300/r700 = #1f9163 da 4.34:1), así que estos tres se fijan por modo.
 */
const GREEN_EXTRA = {
  light: { soft: '#2e7d52', deep: '#004830' }, // blanco-encima 5.03:1 / 10.66:1
  dark: { soft: '#7fdcb6', deep: '#2eae79' }, // texto-oscuro-encima 10.51:1 / 6.11:1
};

/** Construye los 12 colores categóricos de un modo desde la marca. */
function buildCategorical(mode) {
  const r = ramp[mode];
  const a = accents[mode];
  const g = GREEN_EXTRA[mode];
  return [
    r[600], // 0 · CG — verde marca
    a.sky, //  1 · SI — azul
    a.violet, // 2 · AE — violeta
    a.red, //  3 · MP — rojo
    a.teal, // 4 · SE — teal
    a.gold, // 5 · EI — dorado
    r[500], // 6 · verde marca medio (light #007848 5.56:1 / dark #3fc48d 7.78:1)
    a.orange, // 7 · naranja
    a.pink, // 8 · magenta / rosa
    a.lime, // 9 · oliva / lima
    g.deep, // 10 · verde profundo (AA-válido por modo)
    g.soft, // 11 · verde menta/medio (12.º extra, AA-válido por modo)
  ];
}

export const categoricalPaletteByMode = {
  light: buildCategorical('light'),
  dark: buildCategorical('dark'),
};

/** Devuelve el array categórico del modo activo. */
export function categoricalFor(mode) {
  return mode === 'dark' ? categoricalPaletteByMode.dark : categoricalPaletteByMode.light;
}

/** Compat: export plano = paleta del modo claro (consumidores legacy). */
export const categoricalPalette = categoricalPaletteByMode.light;

export default categoricalPalette;
