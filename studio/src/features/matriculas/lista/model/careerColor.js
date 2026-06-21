/**
 * Color categórico por carrera (dominio matrícula). Función PURA.
 * Mapea el CÓDIGO de carrera a un índice de la paleta categórica del design-system
 * y devuelve la CSS var theme-aware `var(--cat-N)` (no un hex): así el color se
 * resuelve según el modo activo (light/dark) que emite `applyThemeVars`. El retorno
 * se consume siempre en contexto CSS (style inline / custom property / background).
 * Fallback determinista por id. Total de slots categóricos: 12 (0–11).
 */
// Códigos REALES de 02-seeders/10-seed-carreras.sql (la institución tiene 3 carreras).
// Cada una fija su slot categórico para que el color sea intencional (no fallback por id).
const CAREER_INDEX = { 'SIS-INF': 1, 'ADM-EMP': 2, 'CON-GEN': 0 };
const CAT_COUNT = 12;

export function careerColor(carrera) {
  if (!carrera) return 'var(--cat-0)';
  const byCode = CAREER_INDEX[carrera.codigo];
  const idx = byCode != null ? byCode : (Number(carrera.id) || 0) % CAT_COUNT;
  return `var(--cat-${idx})`;
}

export default careerColor;
