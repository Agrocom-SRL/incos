/**
 * Adapta respuestas de oferta académica al armado de horarios (fusión con grilla).
 */

export function mapFaltantesToMissingSubjects(faltantes = []) {
  return (faltantes || []).map((f) => ({
    asignaturaPlanId: f.asignaturaPlanId ?? f.asignatura_plan_id,
    materiaId: f.materiaId ?? null,
    materiaNombre: f.materiaNombre ?? f.materia_nombre ?? null,
    materiaSigla: f.materiaCodigo ?? f.materia_codigo ?? null,
    horasSemanalesPlan: f.horasSemanales ?? f.horas_semanales ?? null,
  }));
}

export function mapOfertaCursoToFilaCurso(oc) {
  const id = Number(oc.id);
  const sigla = oc.materiaCodigo ?? oc.materia_codigo ?? oc.materiaSigla ?? '';
  const nombre = oc.materiaNombre ?? oc.materia_nombre ?? '';
  return {
    _rowKey: `curso-${id}`,
    rowKind: 'curso',
    cursoId: id,
    ofertaCursoId: id,
    codigo: sigla ? `${sigla} · OC-${id}` : `OC-${id}`,
    materiaSigla: sigla || null,
    materiaNombre: nombre || null,
    cupoMinimo: null,
    cupoMaximo: null,
    estado: oc.estado ?? null,
    horasSemanalesPlan: oc.horasSemanales ?? oc.horas_semanales ?? null,
    asignacionDocenteId: oc.asignacionDocenteId ?? oc.asignacion_docente_id ?? null,
    docenteNombre: oc.docenteNombre ?? oc.docente_nombre ?? null,
    colorHex: oc.colorHex ?? oc.color_hex ?? null,
  };
}

export function buildFilasOfertaPlantilla(ofertaCursos = [], missingSubjects = []) {
  const sinCurso = (missingSubjects || []).map((m) => ({
    _rowKey: `sin-curso-${m.asignaturaPlanId ?? m.materiaId}`,
    rowKind: 'sin_curso',
    asignaturaPlanId: m.asignaturaPlanId,
    materiaId: m.materiaId,
    materiaNombre: m.materiaNombre,
    materiaSigla: m.materiaSigla,
    horasSemanalesPlan: m.horasSemanalesPlan,
  }));
  const conCurso = (ofertaCursos || []).map(mapOfertaCursoToFilaCurso);
  return [...sinCurso, ...conCurso];
}
