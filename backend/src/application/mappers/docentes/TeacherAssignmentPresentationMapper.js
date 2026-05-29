import { TeacherAssignmentListMapper } from './TeacherAssignmentListMapper.js';

function teacherFullName(row) {
  const parts = [row.docente_nombres, row.docente_apellido_paterno, row.docente_apellido_materno].filter(
    Boolean
  );
  return parts.join(' ').trim() || null;
}

export function enrichedRowToPresentation(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    gestion_plan_id: row.gestion_plan_id != null ? Number(row.gestion_plan_id) : null,
    oferta_curso_id: row.oferta_curso_id != null ? Number(row.oferta_curso_id) : null,
    paralelo_gestion_id:
      row.paralelo_gestion_id != null ? Number(row.paralelo_gestion_id) : null,
    docente_id: row.docente_id != null ? Number(row.docente_id) : null,
    carga_horaria: row.carga_horaria != null ? Number(row.carga_horaria) : null,
    vigente: row.vigente === true || row.vigente === 1,
    motivo: row.motivo ?? null,
    fecha_asignacion: row.fecha_asignacion ?? null,
    materia_sigla: row.materia_sigla ?? null,
    materia_nombre: row.materia_nombre ?? null,
    paralelo_nombre: row.paralelo_nombre ?? null,
    docente_nombre: teacherFullName(row),
    color_hex: row.color_hex ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export function enrichedRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(enrichedRowToPresentation).filter(Boolean);
}

/** Compatibilidad con rutas /docentes/asignaciones (camelCase). */
export function enrichedRowToLegacyPresentation(row) {
  const p = enrichedRowToPresentation(row);
  if (!p) return null;
  return {
    id: p.id,
    gestionPlanId: p.gestion_plan_id,
    ofertaCursoId: p.oferta_curso_id,
    cursoId: null,
    docenteId: p.docente_id,
    cargaHoraria: p.carga_horaria,
    vigente: p.vigente,
    motivo: p.motivo,
    fechaAsignacion: p.fecha_asignacion,
    materiaSigla: p.materia_sigla,
    materiaNombre: p.materia_nombre,
    paraleloNombre: p.paralelo_nombre,
    docenteNombre: p.docente_nombre,
    colorHex: p.color_hex,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export class TeacherAssignmentPresentationMapper {
  static enrichedRowsToPresentation(rows) {
    return enrichedRowsToPresentation(rows);
  }

  static enrichedRowToPresentation(row) {
    return enrichedRowToPresentation(row);
  }

  static enrichedRowToLegacyPresentation(row) {
    return enrichedRowToLegacyPresentation(row);
  }

  static entityToLegacyPresentation(entity) {
    return TeacherAssignmentListMapper.entityToPresentation(entity);
  }
}
