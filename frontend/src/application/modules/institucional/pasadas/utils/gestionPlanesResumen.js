/**
 * Etiqueta legible de un plan habilitado (gestiones_planes).
 */
export function gestionPlanDisplayLabel(plan) {
  if (!plan) return null;
  if (plan.carreraNombre && plan.carreraCodigo) {
    return `${plan.carreraCodigo} — ${plan.carreraNombre}`;
  }
  return (
    plan.carreraNombre ??
    plan.nombre ??
    (plan.planEstudioId ? `Plan #${plan.planEstudioId}` : null)
  );
}

export function isGestionPlanVigente(plan) {
  const estado = String(plan?.estado ?? '').toUpperCase();
  if (estado === 'VIGENTE') return true;
  if (estado && estado !== 'VIGENTE') return false;
  return plan?.activo !== false;
}

export function buildGestionPlanesResumen(planes) {
  const list = Array.isArray(planes) ? planes : [];
  const vigentes = list.filter(isGestionPlanVigente);
  const source = vigentes.length ? vigentes : list;
  const nombresTop = source
    .map(gestionPlanDisplayLabel)
    .filter(Boolean)
    .slice(0, 3);

  return {
    count: list.length,
    nombresTop,
    restantes: Math.max(0, source.length - nombresTop.length),
  };
}
