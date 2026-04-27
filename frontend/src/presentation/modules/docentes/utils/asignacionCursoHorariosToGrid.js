/**
 * Adapta bloques de GET .../cursos/:id/horarios al shape `courseSchedules` de DocenteHorarioSemanalGrid.
 */

function aulaLabel(b) {
  if (b.aulaNombre && b.aulaCodigo) {
    return `${b.aulaCodigo} — ${b.aulaNombre}`.replace(/^ — /, '');
  }
  return b.aulaCodigo || b.aulaNombre || null;
}

/**
 * @param {object[]} bloques
 * @param {string|null} cursoCodigo
 * @param {string|null} paraleloNombre
 * @returns {{ cursoCodigo: string, cursoColorHex: null, bloques: object[] }[]}
 */
export function bloquesToCourseSchedules(bloques, cursoCodigo, paraleloNombre = null) {
  const list = (bloques || []).map((b) => ({
    orden: b.ordenSecuencia ?? b.orden_secuencia,
    dia: b.dia,
    horaInicio: b.horaInicio,
    horaFin: b.horaFin,
    turno: b.turno ?? null,
    paralelo: paraleloNombre,
    aula: aulaLabel(b),
  }));
  if (!list.length) return [];
  return [
    {
      cursoCodigo: cursoCodigo || '—',
      cursoColorHex: null,
      bloques: list,
    },
  ];
}
