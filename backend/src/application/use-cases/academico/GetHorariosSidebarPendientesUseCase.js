import { idONull } from '../../utils/validacionEntrada.js';
/**
 * Lista bloques sin aula, cursos sin docente (por paralelo) y docentes con conflictos operativos (panel lateral).
 */
function groupBloquesSinAula(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const id = idONull(row.paralelo_id);
    if (id == null) continue;
    if (!map.has(id)) {
      map.set(id, {
        paraleloId: id,
        paraleloNombre: row.paralelo_nombre ?? null,
        paraleloTurno: row.paralelo_turno ?? null,
        carreraId: row.carrera_id != null ? Number(row.carrera_id) : null,
        carreraNombre: row.carrera_nombre ?? null,
        periodoNombre: row.periodo_nombre ?? null,
        items: [],
      });
    }
    map.get(id).items.push({
      cursoHorarioId: row.curso_horario_id != null ? Number(row.curso_horario_id) : null,
      cursoId: row.curso_id != null ? Number(row.curso_id) : null,
      cursoCodigo: row.curso_codigo ?? null,
      materiaSigla: row.materia_sigla ?? null,
      materiaNombre: row.materia_nombre ?? null,
      dia: row.dia ?? null,
      horaInicio: row.hora_inicio ?? null,
      horaFin: row.hora_fin ?? null,
      ordenSecuencia: row.orden_secuencia != null ? Number(row.orden_secuencia) : null,
    });
  }
  return [...map.values()].sort((a, b) => String(a.paraleloNombre || '').localeCompare(String(b.paraleloNombre || '')));
}

function groupCursosSinDocente(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const id = idONull(row.paralelo_id);
    if (id == null) continue;
    if (!map.has(id)) {
      map.set(id, {
        paraleloId: id,
        paraleloNombre: row.paralelo_nombre ?? null,
        paraleloTurno: row.paralelo_turno ?? null,
        carreraId: row.carrera_id != null ? Number(row.carrera_id) : null,
        carreraNombre: row.carrera_nombre ?? null,
        periodoNombre: row.periodo_nombre ?? null,
        items: [],
      });
    }
    map.get(id).items.push({
      cursoId: row.curso_id != null ? Number(row.curso_id) : null,
      cursoCodigo: row.curso_codigo ?? null,
      materiaSigla: row.materia_sigla ?? null,
      materiaNombre: row.materia_nombre ?? null,
    });
  }
  return [...map.values()].sort((a, b) => String(a.paraleloNombre || '').localeCompare(String(b.paraleloNombre || '')));
}

function groupDocentesConflictosDetalle(flatRows) {
  const map = new Map();
  for (const r of flatRows || []) {
    const id = idONull(r.docente_id);
    if (id == null) continue;
    const name =
      r.docente_nombre != null ? String(r.docente_nombre).replace(/\s+/g, ' ').trim() || null : null;
    const line = String(r.detalle_linea || '').trim();
    if (!line) continue;
    const pgId = Number(r.paralelo_gestion_id);
    const ocId = Number(r.oferta_curso_id);
    const tipo = String(r.tipo_conflicto || '').trim().toLowerCase();
    if (!map.has(id)) {
      map.set(id, {
        docenteId: id,
        docenteNombre: name,
        lineasDetalle: [],
        paraleloGestionId: null,
        ofertaCursoId: null,
        tiposConflicto: new Set(),
      });
    }
    const entry = map.get(id);
    const arr = entry.lineasDetalle;
    if (!arr.includes(line)) arr.push(line);
    if (tipo) entry.tiposConflicto.add(tipo);
    if (Number.isFinite(pgId) && pgId > 0 && entry.paraleloGestionId == null) {
      entry.paraleloGestionId = pgId;
    }
    if (Number.isFinite(ocId) && ocId > 0 && entry.ofertaCursoId == null) {
      entry.ofertaCursoId = ocId;
    }
  }
  return [...map.values()]
    .map(({ tiposConflicto, ...rest }) => ({
      ...rest,
      tiposConflicto: [...tiposConflicto],
    }))
    .sort((a, b) =>
      String(a.docenteNombre || '').localeCompare(String(b.docenteNombre || ''), 'es'),
    );
}

export class GetHorariosSidebarPendientesUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  async execute() {
    this.logger.info('[Academico] Dashboard horarios — pendientes sidebar');
    const [bloquesRows, cursosRows, docentesConflictosRows] = await Promise.all([
      this.parallelRepository.obtenerBloquesSinAulaDashboard(),
      this.parallelRepository.obtenerCursosSinDocenteDashboard(),
      this.parallelRepository.obtenerDocentesConflictosDetalleDashboard(),
    ]);
    return {
      bloquesSinAulaPorParalelo: groupBloquesSinAula(bloquesRows),
      cursosSinDocentePorParalelo: groupCursosSinDocente(cursosRows),
      docentesConConflictosOperativos: groupDocentesConflictosDetalle(docentesConflictosRows),
    };
  }
}
