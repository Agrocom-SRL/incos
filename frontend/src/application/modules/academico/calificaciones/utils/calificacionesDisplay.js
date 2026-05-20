/**
 * Utilidades de presentación para el módulo de calificaciones.
 */

export function getIniciales(text, fallback = '—') {
  const parts = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return fallback.slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function buildResumenDocente(gruposParalelo = []) {
  let totalCursos = 0;
  let planesListos = 0;
  let planesPendientes = 0;

  for (const g of gruposParalelo) {
    for (const c of g.cursos || []) {
      totalCursos += 1;
      if (c.planListo) planesListos += 1;
      else planesPendientes += 1;
    }
  }

  return {
    totalCursos,
    totalParalelos: gruposParalelo.length,
    planesListos,
    planesPendientes,
  };
}
