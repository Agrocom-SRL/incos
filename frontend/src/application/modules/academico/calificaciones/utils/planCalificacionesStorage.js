/**
 * Persistencia local del plan de calificaciones por asignación docente.
 * Sustituir por API cuando exista el módulo de evaluaciones en backend.
 */

import { BIMESTRES, createPlanVacio } from './calificacionesDefaults.js';

const STORAGE_PREFIX = 'incos:calificaciones:plan:';

function storageKey(asignacionId) {
  return `${STORAGE_PREFIX}${asignacionId}`;
}

export function loadPlanCalificaciones(asignacionId) {
  if (asignacionId == null || asignacionId === '') return createPlanVacio();
  try {
    const raw = localStorage.getItem(storageKey(asignacionId));
    if (!raw) return createPlanVacio();
    const parsed = JSON.parse(raw);
    return { ...createPlanVacio(), ...parsed };
  } catch {
    return createPlanVacio();
  }
}

export function savePlanCalificaciones(asignacionId, plan) {
  if (asignacionId == null || asignacionId === '') return;
  const payload = {
    ...plan,
    configured: true,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(asignacionId), JSON.stringify(payload));
  return payload;
}

export function isPlanListo(plan) {
  if (!plan?.configured) return false;
  const tieneBimestre = BIMESTRES.some((b) => (plan.evaluacionesPorBimestre?.[b] ?? []).length > 0);
  return tieneBimestre;
}

const NOTAS_PREFIX = 'incos:calificaciones:notas:';

export function loadNotasBorrador(asignacionId) {
  try {
    const raw = localStorage.getItem(`${NOTAS_PREFIX}${asignacionId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveNotasBorrador(asignacionId, notas) {
  localStorage.setItem(`${NOTAS_PREFIX}${asignacionId}`, JSON.stringify(notas));
}
