import { aulaParaleloLabel } from './ofertaParaleloUi.js';

function mapAulaItem(aula, { esActual = false, fallbackName } = {}) {
  const id = Number(aula.id);
  return {
    id,
    codigo: aula.codigo ?? null,
    nombre: aula.nombre ?? fallbackName ?? `Aula #${id}`,
    capacidad:
      aula.capacidad != null && aula.capacidad !== '' ? Number(aula.capacidad) : null,
    categoria: aula.categoria ? String(aula.categoria) : null,
    isCurrent: Boolean(esActual),
  };
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
    items.push(mapAulaItem(aula, { esActual }));
  };

  for (const aula of aulas) {
    agregar(aula, Number(aula.id) === Number(aulaIdActual));
  }

  const actualId = Number(aulaIdActual);
  if (Number.isFinite(actualId) && actualId > 0 && !vistos.has(actualId) && detalle) {
    const label = aulaParaleloLabel(detalle);
    items.unshift(
      mapAulaItem(
        {
          id: actualId,
          codigo: detalle.aulaCodigo,
          nombre: detalle.aulaNombre ?? label,
          capacidad: detalle.aulaCapacidad,
          categoria: detalle.aulaCategoria,
        },
        { esActual: true, fallbackName: label ?? `Aula #${actualId}` }
      )
    );
    vistos.add(actualId);
  }

  return items.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
  });
}
