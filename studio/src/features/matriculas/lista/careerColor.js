/**
 * Color categórico por carrera (dominio matrícula). Función PURA.
 * Mapea el CÓDIGO de carrera a un índice de la paleta categórica del design-system
 * (no define colores: los consume como token). Fallback determinista por id.
 */
import { categoricalPalette } from '@ds/tokens';

const CAREER_INDEX = { CG: 0, SI: 1, AE: 2, MP: 3, SE: 4, EI: 5 };

export function careerColor(carrera) {
  if (!carrera) return categoricalPalette[0];
  const byCode = CAREER_INDEX[carrera.codigo];
  const idx = byCode != null ? byCode : (Number(carrera.id) || 0) % categoricalPalette.length;
  return categoricalPalette[idx];
}

export default careerColor;
