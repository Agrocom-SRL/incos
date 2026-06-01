/**
 * Une oferta_cursos del paralelo con asignaciones vigentes para la matriz Sprint 4.
 */

function pickAsignacionField(row, snake, camel) {
  if (row == null) return null;
  if (row[snake] !== undefined && row[snake] !== null) return row[snake];
  if (row[camel] !== undefined && row[camel] !== null) return row[camel];
  return null;
}

export function indexAsignacionesPorOferta(asignaciones = []) {
  const map = new Map();
  for (const row of asignaciones) {
    const ofertaId = Number(pickAsignacionField(row, 'oferta_curso_id', 'ofertaCursoId'));
    if (Number.isFinite(ofertaId) && ofertaId > 0) {
      map.set(ofertaId, row);
    }
  }
  return map;
}

export function buildMatrizRows(ofertaCursos = [], asignaciones = []) {
  const byOferta = indexAsignacionesPorOferta(asignaciones);
  return (ofertaCursos || []).map((oc) => {
    const ofertaCursoId = Number(oc.id);
    const asig = byOferta.get(ofertaCursoId);
    const sigla = oc.materiaCodigo ?? oc.materiaSigla ?? '';
    const nombre = oc.materiaNombre ?? '';
    const materiaLabel = [sigla, nombre].filter(Boolean).join(' — ') || `OC-${ofertaCursoId}`;

    return {
      key: String(ofertaCursoId),
      ofertaCursoId,
      materiaLabel,
      horasPlan: oc.horasSemanales != null ? Number(oc.horasSemanales) : null,
      asignacionId: asig ? Number(pickAsignacionField(asig, 'id', 'id')) : null,
      docenteId: asig ? Number(pickAsignacionField(asig, 'docente_id', 'docenteId')) : null,
      docenteNombre: pickAsignacionField(asig, 'docente_nombre', 'docenteNombre') ?? null,
      colorHex: pickAsignacionField(asig, 'color_hex', 'colorHex') ?? null,
      cargaHoraria: asig
        ? Number(pickAsignacionField(asig, 'carga_horaria', 'cargaHoraria')) || null
        : null,
    };
  });
}

export function mapCargaDocentesIndex(cargaDocentesPayload) {
  const docentes = cargaDocentesPayload?.docentes ?? [];
  const index = new Map();
  for (const row of docentes) {
    const id = Number(row.docente_id);
    if (Number.isFinite(id) && id > 0) {
      index.set(id, {
        cargaSemana: Number(row.carga_semana) || 0,
        maxSemana: Number(row.max_semana) || 20,
        ratio: Number(row.ratio) || 0,
        colorHex: row.color_hex ?? null,
        nombre: row.nombre ?? '',
      });
    }
  }
  return index;
}
