/** Utilidades de presentación para paralelo_gestion (sin fetch). */

export function paraleloEstadoPillClass(estado) {
  const e = String(estado ?? '').toUpperCase();
  if (e === 'PUBLICADO') return 'cfg-materia-pill cfg-materia-pill--activa';
  if (e === 'OFERTADO') return 'cfg-materia-pill cfg-materia-pill--teorica';
  if (e === 'BORRADOR') return 'cfg-materia-pill cfg-materia-pill--clasificacion';
  return 'cfg-materia-pill cfg-materia-pill--default';
}

/** Pill docente en fila de oferta_curso (detalle paralelo). */
export function ofertaCursoDocentePillClass(pendiente) {
  return pendiente
    ? 'cfg-materia-pill cfg-materia-pill--clasificacion'
    : 'cfg-materia-pill cfg-materia-pill--activa';
}

/** Pill estado de oferta_curso (PROGRAMADA, ACTIVA, …). */
export function ofertaCursoEstadoPillClass(estado) {
  const e = String(estado ?? '').toUpperCase();
  if (e === 'ACTIVA') return 'cfg-materia-pill cfg-materia-pill--activa';
  if (e === 'PROGRAMADA') return 'cfg-materia-pill cfg-materia-pill--teorica';
  if (e === 'CERRADA' || e === 'CANCELADA') return 'cfg-materia-pill cfg-materia-pill--inactiva';
  return 'cfg-materia-pill cfg-materia-pill--default';
}

export function aulaParaleloLabel(row) {
  if (row?.aulaCodigo) {
    return row.aulaNombre ? `${row.aulaCodigo} — ${row.aulaNombre}` : row.aulaCodigo;
  }
  if (row?.aulaNombre) return row.aulaNombre;
  return null;
}

export function paraleloCupoLabel(row) {
  const min = row?.cupoMinimo;
  const max = row?.cupoMaximo;
  if (min != null && max != null) return `Cupo: ${min}–${max}`;
  if (max != null) return `Cupo máx.: ${max}`;
  if (min != null) return `Cupo mín.: ${min}`;
  return null;
}

export function paraleloDocenteResumen(cobertura) {
  if (!cobertura) return null;
  const total = Number(cobertura.cursos_total ?? cobertura.cursosTotal ?? 0);
  const conDocente = Number(cobertura.cursos_con_docente ?? cobertura.cursosConDocente ?? 0);
  if (!total) return null;
  if (conDocente >= total) return 'Docente: completo';
  if (conDocente > 0) return `Docente: ${conDocente}/${total} cursos`;
  return 'Docente: pendiente';
}

export function paraleloAsignacionFlags(pg, cobertura) {
  const total = Number(cobertura?.cursos_total ?? cobertura?.cursosTotal ?? 0);
  const conDocente = Number(cobertura?.cursos_con_docente ?? cobertura?.cursosConDocente ?? 0);

  // Horarios según los bloques realmente armados (vista ficha), no según el
  // estado: un paralelo en BORRADOR puede tener su grilla completa.
  const bloquesReq = Number(pg?.bloquesRequeridos ?? 0);
  const bloquesAsig = Number(pg?.bloquesAsignados ?? 0);
  const horarioCompleto = bloquesReq > 0 && bloquesAsig >= bloquesReq;
  const horarioParcial = bloquesAsig > 0 && !horarioCompleto;

  return {
    aula: Boolean(pg?.aulaId),
    docente: total > 0 && conDocente >= total,
    docenteParcial: total > 0 && conDocente > 0 && conDocente < total,
    horarios: horarioCompleto,
    horariosEnArmado: horarioParcial,
  };
}
