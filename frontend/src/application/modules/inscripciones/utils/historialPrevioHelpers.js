/**
 * Utilidades para historial de notas al inscribir (tabla historial_previo).
 */

const TIPOS_CON_HISTORIAL = ['ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'];

export const DEFAULT_NOTA_HISTORIAL = 61;
export const HISTORIAL_ESTADOS = ['APROBADO', 'CONVALIDADO'];

export function requiereHistorialPrevio(tipoAdmision) {
  return TIPOS_CON_HISTORIAL.includes(String(tipoAdmision ?? '').toUpperCase());
}

export function isHistorialPrevioPendiente(record) {
  const tipo = String(
    record?.tipoInscripcion ?? record?.enrollment?.tipoInscripcion ?? ''
  ).toUpperCase();
  if (!requiereHistorialPrevio(tipo)) return false;

  const estado =
    record?.historialPrevioEstado ??
    (record?.requiereHistorialPrevio === false
      ? 'NO_APLICA'
      : (record?.cantidadHistorialPrevio ?? 0) > 0
        ? 'REGISTRADO'
        : 'PENDIENTE');

  return estado === 'PENDIENTE';
}

export function computeConcludedPeriods({
  tipoAdmision,
  periodos = [],
  selectedPeriodIds = [],
  periodosDisabledByTraspaso = null,
}) {
  const tipo = String(tipoAdmision ?? '').toUpperCase();
  if (!requiereHistorialPrevio(tipo) || !periodos.length) return [];

  const selected = periodos.filter((p) =>
    selectedPeriodIds.some((id) => Number(id) === Number(p.id))
  );
  const minSelectedNumero =
    selected.length > 0
      ? Math.min(...selected.map((p) => Number(p.numero ?? p.id) || 999))
      : null;

  return periodos
    .map((p) => {
      const numero = Number(p.numero ?? 0);
      let include = false;
      let status = 'APROBADO';

      if (tipo === 'TRASPASO') {
        if (periodosDisabledByTraspaso?.[numero] === true) {
          include = true;
          status = 'CONVALIDADO';
        }
      } else if (tipo === 'TRANSITABILIDAD') {
        if (minSelectedNumero != null && numero < minSelectedNumero) {
          include = true;
          status = 'CONVALIDADO';
        }
      } else if (tipo === 'ANTIGUO') {
        if (minSelectedNumero != null && numero < minSelectedNumero) {
          include = true;
          status = 'APROBADO';
        }
      }

      if (!include) return null;
      return {
        periodId: p.id,
        periodNumero: numero,
        periodName: p.nombre || `Periodo ${numero}`,
        status,
      };
    })
    .filter(Boolean);
}

export function historialPrevioRowKey(periodId, materiaId) {
  return `${periodId}:${materiaId}`;
}

export function parseHistorialPrevioRowKey(key) {
  const [periodId, materiaId] = String(key).split(':');
  return { periodId: Number(periodId), materiaId: Number(materiaId) };
}

export function resolveRowStatus(statusByKey, key, defaultStatus) {
  const s = statusByKey?.[key] ?? defaultStatus ?? 'APROBADO';
  return String(s).toUpperCase() === 'CONVALIDADO' ? 'CONVALIDADO' : 'APROBADO';
}

export function buildHistorialPrevioRows(
  concludedPeriods,
  materiasByPeriod,
  gradesByKey = {},
  statusByKey = {}
) {
  const rows = [];
  for (const period of concludedPeriods) {
    const materias = materiasByPeriod?.[period.periodId] ?? materiasByPeriod?.[String(period.periodId)] ?? [];
    for (const materia of materias) {
      if (!materia?.id) continue;
      const key = historialPrevioRowKey(period.periodId, materia.id);
      const status = resolveRowStatus(statusByKey, key, period.status);
      rows.push({
        key,
        periodId: period.periodId,
        periodName: period.periodName,
        periodNumero: period.periodNumero,
        gestionAcademica: period.periodName,
        materiaId: materia.id,
        materiaSigla: materia.sigla,
        materiaNombre: materia.nombre,
        status,
        nota: status === 'APROBADO' ? gradesByKey[key] ?? null : null,
      });
    }
  }
  return rows;
}

export function buildPriorHistoryPayload(
  gradesByKey,
  statusByKey,
  concludedPeriods,
  materiasByPeriod
) {
  const rows = buildHistorialPrevioRows(
    concludedPeriods,
    materiasByPeriod,
    gradesByKey,
    statusByKey
  );

  return rows
    .map((r) => {
      const item = {
        materia_id: r.materiaId,
        period_id: r.periodId,
        status: r.status,
      };
      if (r.status === 'APROBADO') {
        const nota = r.nota;
        if (nota == null || nota === '' || Number.isNaN(Number(nota))) return null;
        item.final_grade = Number(nota);
      } else {
        item.final_grade = null;
      }
      return item;
    })
    .filter(Boolean);
}

export function seedHistorialFromPriorEnrollmentHistories(priorHistories = []) {
  const gradesByKey = {};
  const statusByKey = {};
  if (!Array.isArray(priorHistories)) return { gradesByKey, statusByKey };

  for (const h of priorHistories) {
    const periodId = h.periodoId ?? h.periodId ?? h.period_id;
    const materiaId = h.materiaId ?? h.materia_id;
    if (periodId == null || materiaId == null) continue;

    const key = historialPrevioRowKey(periodId, materiaId);
    const status = resolveRowStatus(
      {},
      key,
      h.estado ?? h.status ?? 'APROBADO'
    );
    statusByKey[key] = status;

    if (status === 'APROBADO') {
      const nota = h.notaFinal ?? h.finalGrade ?? h.final_grade;
      if (nota != null && nota !== '') {
        gradesByKey[key] = Number(nota);
      }
    }
  }

  return { gradesByKey, statusByKey };
}

export function historialPrevioEstadoLabel(estado) {
  switch (String(estado ?? '').toUpperCase()) {
    case 'REGISTRADO':
      return { text: 'Historial registrado', color: 'success' };
    case 'PENDIENTE':
      return { text: 'Historial pendiente', color: 'warning' };
    case 'NO_APLICA':
    default:
      return { text: 'No aplica', color: 'default' };
  }
}

export function validateHistorialPrevioGrades(
  gradesByKey,
  statusByKey,
  concludedPeriods,
  materiasByPeriod
) {
  const rows = buildHistorialPrevioRows(
    concludedPeriods,
    materiasByPeriod,
    gradesByKey,
    statusByKey
  );
  if (rows.length === 0) return { valid: true, missing: 0, invalid: [], invalidKeys: [] };

  const invalid = [];
  const invalidKeys = [];
  let missing = 0;

  for (const row of rows) {
    if (row.status === 'CONVALIDADO') continue;

    const nota = row.nota;
    if (nota == null || nota === '') {
      missing += 1;
      if (row.key) invalidKeys.push(row.key);
      continue;
    }
    const n = Number(nota);
    if (Number.isNaN(n) || n < 0 || n > 100) {
      invalid.push({ ...row, reason: 'La nota debe estar entre 0 y 100' });
      if (row.key) invalidKeys.push(row.key);
    }
  }

  return {
    valid: missing === 0 && invalid.length === 0,
    missing,
    invalid,
    invalidKeys,
    total: rows.length,
  };
}
