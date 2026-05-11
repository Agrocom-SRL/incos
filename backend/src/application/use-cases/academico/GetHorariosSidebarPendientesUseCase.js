/**
 * Lista bloques sin aula y cursos sin docente, agrupados por paralelo (panel lateral).
 */
function groupBloquesSinAula(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const id = Number(row.paralelo_id);
    if (!Number.isFinite(id)) continue;
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
    const id = Number(row.paralelo_id);
    if (!Number.isFinite(id)) continue;
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

export class GetHorariosSidebarPendientesUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  async execute() {
    this.logger.info('[Academico] Dashboard horarios — pendientes sidebar');
    const [bloquesRows, cursosRows] = await Promise.all([
      this.parallelRepository.obtenerBloquesSinAulaDashboard(),
      this.parallelRepository.obtenerCursosSinDocenteDashboard(),
    ]);
    return {
      bloquesSinAulaPorParalelo: groupBloquesSinAula(bloquesRows),
      cursosSinDocentePorParalelo: groupCursosSinDocente(cursosRows),
    };
  }
}
