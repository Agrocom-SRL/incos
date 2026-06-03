import { aulaParaleloLabel } from './ofertaParaleloUi.js';

function formatAulaNombre(aula) {
  return [aula.codigo, aula.nombre].filter(Boolean).join(' — ') || `Aula #${aula.id}`;
}

function formatAulaDescripcion(aula, esActual) {
  const partes = [];
  if (aula.capacidad != null && aula.capacidad !== '') {
    partes.push(`Capacidad: ${aula.capacidad}`);
  }
  if (aula.categoria) partes.push(String(aula.categoria));
  if (esActual) partes.push('Asignada a este paralelo');
  return partes.length ? partes.join(' · ') : null;
}

/**
 * Aulas para modal de asignación: la del paralelo actual + libres en la gestión.
 */
export function buildAulasParaModalItems({
  aulas = [],
  paralelosEnPlan = [],
  paraleloGestionId,
  aulaIdActual,
  detalle,
}) {
  const ocupadaPorOtro = new Map();
  for (const pg of paralelosEnPlan) {
    const aulaId = Number(pg.aulaId);
    if (!Number.isFinite(aulaId) || aulaId < 1) continue;
    if (Number(pg.id) === Number(paraleloGestionId)) continue;
    ocupadaPorOtro.set(
      aulaId,
      pg.paraleloNombre ?? `Paralelo #${pg.id}`,
    );
  }

  const items = [];
  const vistos = new Set();

  const agregar = (aula, esActual) => {
    const id = Number(aula.id);
    if (!Number.isFinite(id) || id < 1 || vistos.has(id)) return;
    if (ocupadaPorOtro.has(id)) return;
    vistos.add(id);
    items.push({
      id,
      name: formatAulaNombre(aula),
      description: formatAulaDescripcion(aula, esActual),
      isCurrent: Boolean(esActual),
    });
  };

  for (const aula of aulas) {
    agregar(aula, Number(aula.id) === Number(aulaIdActual));
  }

  const actualId = Number(aulaIdActual);
  if (Number.isFinite(actualId) && actualId > 0 && !vistos.has(actualId) && detalle) {
    items.unshift({
      id: actualId,
      name: aulaParaleloLabel(detalle) ?? `Aula #${actualId}`,
      description: 'Asignada a este paralelo',
      isCurrent: true,
    });
    vistos.add(actualId);
  }

  return items.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
  });
}
