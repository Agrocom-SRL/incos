/**
 * Agrupa asignaciones docente (cursos) por paralelo para la vista de calificaciones.
 */

export function groupCursosPorParalelo(assignments = []) {
  const vigentes = (assignments || []).filter((a) => a.vigente !== false && a.id != null);
  const paraleloOrder = [];
  const tree = new Map();

  for (const a of vigentes) {
    const key = [a.paralelo, a.turnoParalelo, a.carrera].filter(Boolean).join(' · ') || 'Sin paralelo';
    if (!tree.has(key)) {
      tree.set(key, {
        paraleloKey: key,
        paralelo: a.paralelo || '—',
        turno: a.turnoParalelo,
        carrera: a.carrera,
        carreraColorHex: a.carreraColorHex,
        gestion: a.gestion,
        cursos: [],
      });
      paraleloOrder.push(key);
    }
    tree.get(key).cursos.push({
      asignacionId: a.id,
      materia: a.materia,
      siglaMateria: a.siglaMateria,
      periodoMateriaPlan: a.periodoMateriaPlan,
      cursoCodigo: a.cursoCodigo,
      cursoColorHex: a.cursoColorHex,
      cargaHorariaSemanal: a.cargaHorariaSemanal,
      gestion: a.gestion,
      planHabilitado: a.planHabilitado,
      raw: a,
    });
  }

  return paraleloOrder.map((k) => tree.get(k));
}
