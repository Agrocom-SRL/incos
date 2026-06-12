import { BaseMapper } from '../base/index.js';

export function rowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.id,
    gestionPlanId: row.gestionPlanId,
    paraleloId: row.paraleloId,
    aulaId: row.aulaId ?? null,
    turno: row.turno,
    estado: row.estado,
    cupoMaximo: row.cupoMaximo,
    cupoMinimo: row.cupoMinimo,
    observaciones: row.observaciones ?? null,
    activo: row.activo !== undefined ? !!row.activo : true,
    paraleloNombre: row.paraleloNombre ?? null,
    paraleloTurnoMaestro: row.paraleloTurnoMaestro ?? null,
    paraleloDescripcion: row.paraleloDescripcion ?? null,
    periodoId: row.periodoId ?? null,
    periodoNombre: row.periodoNombre ?? null,
    periodoNumero: row.periodoNumero != null ? Number(row.periodoNumero) : null,
    carreraId: row.carreraId ?? null,
    carreraNombre: row.carreraNombre ?? null,
    carreraCodigo: row.carreraCodigo ?? null,
    carreraImagenRuta: row.carreraImagenRuta ?? null,
    carreraColorHex: row.carreraColorHex ?? null,
    aulaCodigo: row.aulaCodigo ?? null,
    aulaNombre: row.aulaNombre ?? null,
    planEstudioId: row.planEstudioId ?? null,
    planNombre: row.planNombre ?? null,
    gestionId: row.gestionId ?? null,
    ofertaActual: row.ofertaActual != null ? Number(row.ofertaActual) : undefined,
    bloquesRequeridos: row.bloquesRequeridos != null ? Number(row.bloquesRequeridos) : 0,
    bloquesAsignados: row.bloquesAsignados != null ? Number(row.bloquesAsignados) : 0,
  };
}

export function entityToPresentation(entity) {
  if (!entity) return null;
  const p = {};
  BaseMapper.mapBaseFields(entity, p);
  BaseMapper.mapFieldIfExists(entity, 'managementPlanId', 'gestionPlanId', p);
  BaseMapper.mapFieldIfExists(entity, 'parallelId', 'paraleloId', p);
  BaseMapper.mapFieldIfExists(entity, 'classroomId', 'aulaId', p);
  BaseMapper.mapFieldIfExists(entity, 'shift', 'turno', p);
  BaseMapper.mapFieldIfExists(entity, 'state', 'estado', p);
  BaseMapper.mapFieldIfExists(entity, 'maxCapacity', 'cupoMaximo', p);
  BaseMapper.mapFieldIfExists(entity, 'minCapacity', 'cupoMinimo', p);
  BaseMapper.mapFieldIfExists(entity, 'observations', 'observaciones', p);
  return p;
}

export function rowsToPresentation(rows) {
  return (rows || []).map(rowToPresentation).filter(Boolean);
}

export function entitiesToPresentation(entities) {
  return (entities || []).map(entityToPresentation).filter(Boolean);
}
