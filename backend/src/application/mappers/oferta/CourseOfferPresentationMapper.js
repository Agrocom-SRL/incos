import { BaseMapper } from '../base/index.js';

export function rowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.id,
    paraleloGestionId: row.paraleloGestionId,
    asignaturaPlanId: row.asignaturaPlanId,
    estado: row.estado,
    observaciones: row.observaciones ?? null,
    activo: row.activo !== undefined ? !!row.activo : true,
    horasSemanales: row.horasSemanales != null ? Number(row.horasSemanales) : null,
    creditos: row.creditos != null ? Number(row.creditos) : null,
    periodoId: row.periodoId ?? null,
    materiaId: row.materiaId ?? null,
    materiaNombre: row.materiaNombre ?? null,
    materiaCodigo: row.materiaCodigo ?? null,
    asignacionDocenteId:
      row.asignacionDocenteId != null ? Number(row.asignacionDocenteId) : null,
    docenteId: row.docenteId != null ? Number(row.docenteId) : null,
    docenteNombre: row.docenteNombre?.trim() || null,
    colorHex: row.colorHex ?? null,
    cargaHorariaAsignacion:
      row.cargaHorariaAsignacion != null ? Number(row.cargaHorariaAsignacion) : null,
    fechaAsignacion: row.fechaAsignacion ?? null,
  };
}

export function entityToPresentation(entity) {
  if (!entity) return null;
  const p = {};
  BaseMapper.mapBaseFields(entity, p);
  BaseMapper.mapFieldIfExists(entity, 'parallelManagementId', 'paraleloGestionId', p);
  BaseMapper.mapFieldIfExists(entity, 'planSubjectId', 'asignaturaPlanId', p);
  BaseMapper.mapFieldIfExists(entity, 'state', 'estado', p);
  BaseMapper.mapFieldIfExists(entity, 'observations', 'observaciones', p);
  return p;
}

export function rowsToPresentation(rows) {
  return (rows || []).map(rowToPresentation).filter(Boolean);
}

export function entitiesToPresentation(entities) {
  return (entities || []).map(entityToPresentation).filter(Boolean);
}
