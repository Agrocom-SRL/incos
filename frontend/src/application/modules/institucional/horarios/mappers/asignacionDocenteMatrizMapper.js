/**
 * Une oferta_cursos del paralelo con asignaciones vigentes para la matriz Sprint 4.
 */

export function pickAsignacionField(row, snake, camel) {
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

/** Horas semanales que aporta esta asignación al docente. */
export function horasMateriaParaAsignacion({ horasAsignacion, horasPlan } = {}) {
  const h = horasAsignacion ?? horasPlan;
  if (h == null || h === '') return 0;
  const n = Number(h);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Carga semanal proyectada si se asigna la materia al docente (gestión vigente).
 * Si ya es el docente del curso, la carga del API ya incluye esas horas.
 */
export function proyectarCargaSemanaDocente({
  docenteId,
  cargaPorDocente,
  maxHorasSemana,
  horasMateria,
  docenteActualCursoId,
}) {
  const id = Number(docenteId);
  const carga = cargaPorDocente?.get(id);
  const base = Number(carga?.cargaSemana) || 0;
  const max = Number(maxHorasSemana ?? carga?.maxSemana) || 20;
  const horas = Number(horasMateria) || 0;
  const esDocenteActual =
    docenteActualCursoId != null && Number(docenteActualCursoId) === id;
  const projected = esDocenteActual ? base : base + horas;
  return {
    cargaSemana: base,
    projected,
    maxSemana: max,
    sobrecarga: projected > max,
    disponible: Math.max(0, max - projected),
  };
}

const MAX_CANDIDATOS_LIBRES = 10;
const MAX_CANDIDATOS_CON_RIESGO = 5;

/**
 * Lista de docentes para el modal de asignación: hasta 10 libres + hasta 5 con choque/carga alta.
 */
export function buildDocenteAsignacionCandidatos({
  docentes = [],
  candidateSearch = '',
  docentesConChoque = new Set(),
  cargaPorDocente = new Map(),
  horasMateria = 0,
  docenteActualCursoId = null,
  selectedDocenteId = null,
} = {}) {
  const query = String(candidateSearch ?? '').trim().toLowerCase();
  const horas = Number(horasMateria) || 0;

  const mapped = docentes
    .filter((d) => {
      if (!query) return true;
      return String(d.nombreCompleto || '').toLowerCase().includes(query);
    })
    .map((d) => {
      const id = Number(d.id);
      const chocaBloques = docentesConChoque.has(id);
      const hasConflicts = Boolean(d.teachingStats?.conflictos?.hasConflictos);
      const carga = proyectarCargaSemanaDocente({
        docenteId: id,
        cargaPorDocente,
        maxHorasSemana: d.maxHorasSemana,
        horasMateria: horas,
        docenteActualCursoId,
      });
      let semaforo = 'verde';
      if (chocaBloques) {
        semaforo = 'rojo';
      } else if (carga.sobrecarga || hasConflicts) {
        semaforo = 'amarillo';
      }
      return {
        ...d,
        semaforo,
        chocaBloques,
        cargaProyectada: carga,
        hasConflicts,
      };
    });

  const libres = mapped.filter((d) => d.semaforo === 'verde');
  const conRiesgo = mapped.filter((d) => d.semaforo !== 'verde');
  const picked = [
    ...libres.slice(0, MAX_CANDIDATOS_LIBRES),
    ...conRiesgo.slice(0, MAX_CANDIDATOS_CON_RIESGO),
  ];

  const selectedId = Number(selectedDocenteId);
  if (Number.isFinite(selectedId) && selectedId > 0 && !picked.some((d) => Number(d.id) === selectedId)) {
    const current = mapped.find((d) => Number(d.id) === selectedId);
    if (current) return [current, ...picked].slice(0, MAX_CANDIDATOS_LIBRES + MAX_CANDIDATOS_CON_RIESGO + 1);
  }
  return picked;
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
