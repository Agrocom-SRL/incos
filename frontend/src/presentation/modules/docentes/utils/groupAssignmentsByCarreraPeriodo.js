/**
 * Agrupa asignaciones docente: carrera → periodo (orden de primera aparición).
 */

import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

export const assignmentRowKey = (row) =>
  [
    row.cursoCodigo,
    row.siglaMateria,
    row.paralelo,
    row.turnoParalelo,
    row.periodoMateriaPlan,
    row.periodoParalelo,
    row.vigente ? '1' : '0',
    row.materia,
    row.carrera,
    row.cursoColorHex,
  ]
    .map((v) => (v == null ? '' : String(v)))
    .join('\u0001');

export function groupAssignmentsByCarreraPeriodo(assignments) {
  const carreraOrder = [];
  const tree = new Map();

  for (const a of assignments || []) {
    const c = a.carrera || 'Sin carrera definida';
    const p = a.periodoMateriaPlan || a.periodoParalelo || 'Sin periodo';
    if (!tree.has(c)) {
      tree.set(c, { byPeriod: new Map(), periodOrder: [] });
      carreraOrder.push(c);
    }
    const node = tree.get(c);
    if (!node.byPeriod.has(p)) {
      node.byPeriod.set(p, []);
      node.periodOrder.push(p);
    }
    node.byPeriod.get(p).push(a);
  }

  return carreraOrder.map((c) => {
    const n = tree.get(c);
    const periodos = n.periodOrder.map((p) => ({ periodo: p, rows: n.byPeriod.get(p) }));
    const first = periodos[0]?.rows?.[0];
    const carreraColorHex = sanitizeDocenteColorHex(first?.carreraColorHex);
    return { carrera: c, carreraColorHex, periodos };
  });
}
