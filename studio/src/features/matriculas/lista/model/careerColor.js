/**
 * Color categórico por carrera (dominio matrícula). Función PURA.
 * Mapea el CÓDIGO de carrera a un índice de la paleta categórica del design-system
 * y devuelve la CSS var theme-aware `var(--cat-N)` (no un hex): así el color se
 * resuelve según el modo activo (light/dark) que emite `applyThemeVars`. El retorno
 * se consume siempre en contexto CSS (style inline / custom property / background).
 * Fallback determinista por id. Total de slots categóricos: 12 (0–11).
 */
const CAREER_INDEX = { CG: 0, SI: 1, AE: 2, MP: 3, SE: 4, EI: 5 };
const CAT_COUNT = 12;

export function careerColor(carrera) {
  if (!carrera) return 'var(--cat-0)';
  const byCode = CAREER_INDEX[carrera.codigo];
  const idx = byCode != null ? byCode : (Number(carrera.id) || 0) % CAT_COUNT;
  return `var(--cat-${idx})`;
}

export default careerColor;
