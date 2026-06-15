/**
 * Filtra asignaciones del docente a la gestión académica vigente.
 * @param {Array<{ vigente?: boolean, gestion?: string|null }>} assignments
 * @param {{ nombre?: string, gestion?: string, anio?: number|string, year?: number|string }|null} gestionVigente
 */
export function filterAssignmentsGestionVigente(assignments = [], gestionVigente = null) {
  const vigentes = (assignments || []).filter((a) => a?.vigente !== false);
  if (!gestionVigente) return vigentes;

  const label = String(gestionVigente.nombre || gestionVigente.gestion || '').trim();
  const anio = gestionVigente.anio ?? gestionVigente.year;
  const anioStr = anio != null ? String(anio) : '';

  return vigentes.filter((a) => {
    const g = String(a.gestion || '').trim();
    if (!g) return true;
    if (anioStr && g.includes(anioStr)) return true;
    if (label && g.toLowerCase().includes(label.toLowerCase())) return true;
    return false;
  });
}
