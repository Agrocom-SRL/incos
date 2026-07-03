/**
 * Agrupa los cursos del docente (shape de `mapCursoDocente`) en CARRERA → PERIODO,
 * en orden de primera aparición — espejo de `groupAssignmentsByCarreraPeriodo`
 * (ficha del docente), adaptado a los campos del mi-resumen-docente.
 *
 * El color de carrera es dato de negocio (hex de seeders) y se sanitiza aquí,
 * en presentación, antes de pintarse (única excepción a inline permitida).
 */

import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

/**
 * @param {Array} cursos - cursos ya mapeados por `useDocenteHome` (mapCursoDocente).
 * @returns {Array<{ carrera: string, carreraColorHex: string|null,
 *   periodos: Array<{ periodo: string, cursos: Array }> }>}
 */
export function groupCursosDocentePorCarrera(cursos) {
  const carreraOrder = [];
  const tree = new Map();

  for (const curso of cursos || []) {
    const c = curso.carrera || 'Sin carrera definida';
    const p = curso.periodo || 'Sin periodo';
    if (!tree.has(c)) {
      tree.set(c, { byPeriod: new Map(), periodOrder: [], colorHex: curso.carreraColor || null });
      carreraOrder.push(c);
    }
    const node = tree.get(c);
    if (!node.byPeriod.has(p)) {
      node.byPeriod.set(p, []);
      node.periodOrder.push(p);
    }
    node.byPeriod.get(p).push(curso);
  }

  return carreraOrder.map((c) => {
    const n = tree.get(c);
    return {
      carrera: c,
      carreraColorHex: sanitizeDocenteColorHex(n.colorHex),
      periodos: n.periodOrder.map((p) => ({ periodo: p, cursos: n.byPeriod.get(p) })),
    };
  });
}

export default groupCursosDocentePorCarrera;
