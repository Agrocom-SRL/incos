const DIAS_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

function parseIdList(raw) {
  if (raw == null || raw === '') return [];
  return String(raw)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function uniqueSortedIds(ids) {
  return [...new Set(ids.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0))].sort(
    (a, b) => a - b
  );
}

/**
 * Arma la respuesta GET /paralelos-gestion/:id/grilla-horario.
 */
export class GrillaHorarioPresentationMapper {
  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   * @param {string|null} params.paraleloGestionEstado
   * @param {string|null} params.turno
   * @param {Array<Object>} params.bloques
   * @param {Array<Object>} params.coberturaRows
   * @param {Array<Object>} params.conflictosParalelo
   * @param {Array<Object>} params.conflictosAula
   * @param {Array<Object>} params.conflictosDocente
   * @param {Array<Object>} [params.franjasCatalogo]
   */
  static toPresentation({
    paraleloGestionId,
    paraleloGestionEstado = null,
    turno,
    bloques = [],
    coberturaRows = [],
    conflictosParalelo = [],
    conflictosAula = [],
    conflictosDocente = [],
    franjasCatalogo = [],
  }) {
    const conflictAssignmentIds = new Set();
    const conflictHorarioIds = new Set();

    const conflictos = [];

    for (const row of conflictosParalelo) {
      const horarioId = Number(row.horarioId);
      const ids = parseIdList(row.asignacionIds);
      ids.forEach((id) => conflictAssignmentIds.add(id));
      if (Number.isFinite(horarioId)) conflictHorarioIds.add(horarioId);
      conflictos.push({
        tipo: 'PARALELO',
        horario_id: horarioId,
        asignaciones_involucradas: ids,
        mensaje: 'Dos o más materias del paralelo comparten el mismo bloque horario',
      });
    }

    for (const row of conflictosAula) {
      const horarioId = Number(row.horarioId);
      const ids = uniqueSortedIds(parseIdList(row.asignacionIds));
      ids.forEach((id) => conflictAssignmentIds.add(id));
      if (Number.isFinite(horarioId)) conflictHorarioIds.add(horarioId);
      conflictos.push({
        tipo: 'AULA',
        horario_id: horarioId,
        aula_id: row.aulaId != null ? Number(row.aulaId) : null,
        asignaciones_involucradas: ids,
        mensaje: 'La misma aula está asignada a más de una materia en el mismo bloque',
      });
    }

    const docentePairsSeen = new Set();
    for (const row of conflictosDocente) {
      const horarioId = Number(row.horarioId);
      const id1 = Number(row.asignacionId1);
      const id2 = Number(row.asignacionId2);
      const pairKey = [Math.min(id1, id2), Math.max(id1, id2), horarioId].join('-');
      if (docentePairsSeen.has(pairKey)) continue;
      docentePairsSeen.add(pairKey);

      const ids = uniqueSortedIds([id1, id2]);
      ids.forEach((id) => conflictAssignmentIds.add(id));
      if (Number.isFinite(horarioId)) conflictHorarioIds.add(horarioId);

      const nombre = (row.docenteNombre || '').replace(/\s+/g, ' ').trim() || 'Docente';
      conflictos.push({
        tipo: 'DOCENTE',
        horario_id: horarioId,
        asignaciones_involucradas: ids,
        mensaje: `${nombre} tiene dos materias en el mismo bloque horario`,
      });
    }

    const grilla = Object.fromEntries(DIAS_ORDEN.map((d) => [d, []]));

    for (const b of bloques) {
      const dia = b.dia;
      if (!dia || !grilla[dia]) continue;

      const asignacionDocenteId = Number(b.asignacionDocenteId);
      const horarioId = Number(b.horarioId);
      const aulaId = b.aulaId != null ? Number(b.aulaId) : null;

      const tieneConflicto =
        conflictAssignmentIds.has(asignacionDocenteId) ||
        (Number.isFinite(horarioId) && conflictHorarioIds.has(horarioId));

      grilla[dia].push({
        asignacion_horario_id: Number(b.asignacionHorarioId),
        horario_id: horarioId,
        hora_inicio: b.horaInicio ?? null,
        hora_fin: b.horaFin ?? null,
        asignacion_docente_id: asignacionDocenteId,
        docente_id: b.docenteId != null ? Number(b.docenteId) : null,
        oferta_curso_id: Number(b.ofertaCursoId),
        asignatura: b.asignatura ?? null,
        materia_nombre: b.materiaNombre ?? null,
        carrera_nombre: b.carreraNombre ?? null,
        docente: (b.docenteNombre || '').replace(/\s+/g, ' ').trim() || null,
        color_hex: b.colorHex ?? null,
        aula_id: aulaId,
        aula_nombre: b.aulaNombre ?? b.aulaCodigo ?? null,
        tiene_conflicto: tieneConflicto,
      });
    }

    const asignacionesCobertura = coberturaRows.map((row) => {
      const requeridas = Number(row.horasRequeridas) || 0;
      const asignados = Number(row.bloquesAsignados) || 0;
      return {
        asignacion_docente_id: Number(row.asignacionDocenteId),
        asignatura: row.asignatura ?? null,
        horas_requeridas: requeridas,
        bloques_asignados: asignados,
        ok: requeridas > 0 ? asignados >= requeridas : asignados > 0,
      };
    });

    const completa =
      asignacionesCobertura.length > 0 && asignacionesCobertura.every((a) => a.ok === true);

    const franjas = (franjasCatalogo || []).map((f) => {
      const hi = f.horaInicio != null ? String(f.horaInicio).slice(0, 5) : null;
      const hf = f.horaFin != null ? String(f.horaFin).slice(0, 5) : null;
      return {
        horario_id: Number(f.horarioId),
        dia: f.dia ?? null,
        hora_inicio: hi,
        hora_fin: hf,
        turno: f.turno ?? turno ?? null,
        numero_bloque: f.numeroBloque != null ? Number(f.numeroBloque) : null,
      };
    });

    return {
      paralelo_gestion_id: paraleloGestionId,
      paralelo_gestion_estado: paraleloGestionEstado ?? null,
      turno: turno ?? null,
      grilla,
      franjas,
      conflictos,
      cobertura: {
        completa,
        asignaciones: asignacionesCobertura,
      },
    };
  }
}
