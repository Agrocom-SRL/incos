/**
 * Color categórico por carrera (dominio matrícula). Función PURA.
 * Mapa por código; fallback a un color de la paleta según el id.
 */
const CAREER_COLOR_MAP = {
  CG: '#006048',
  SI: '#3d6dd0',
  AE: '#7a4cb8',
  MP: '#c0282a',
  SE: '#0a8a96',
  EI: '#b07e10',
};

const FALLBACK = ['#006048', '#3d6dd0', '#7a4cb8', '#c0282a', '#0a8a96', '#b07e10', '#1f9163', '#2f5fb0'];

export function careerColor(carrera) {
  if (!carrera) return FALLBACK[0];
  if (carrera.codigo && CAREER_COLOR_MAP[carrera.codigo]) return CAREER_COLOR_MAP[carrera.codigo];
  const idx = Number(carrera.id) || 0;
  return FALLBACK[idx % FALLBACK.length];
}

export default careerColor;
