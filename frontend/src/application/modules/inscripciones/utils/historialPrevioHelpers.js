/**
 * Utilidades para historial previo al inscribir (tabla historial_previo).
 * Materias concluidas antes de la gestión vigente: APROBADO (antiguo) o CONVALIDADO (traspaso/transitabilidad).
 */

const TIPOS_CON_HISTORIAL = ['ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'];

export const DEFAULT_NOTA_HISTORIAL = 70;
export const NOTA_MINIMA_APROBACION = 61;

export function requiereHistorialPrevio(tipoAdmision) {
  return TIPOS_CON_HISTORIAL.includes(String(tipoAdmision ?? '').toUpperCase());
}

/**
 * Periodos cuyas materias van a historial_previo (no se matriculan en la gestión).
 * @returns {Array<{ periodId, periodNumero, periodName, status: 'APROBADO'|'CONVALIDADO' }>}
 */
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

/**
 * Construye filas para la UI a partir de periodos concluidos y materias cargadas por periodo.
 */
export function buildHistorialPrevioRows(concludedPeriods, materiasByPeriod, gradesByKey = {}) {
  const rows = [];
  for (const period of concludedPeriods) {
    const materias = materiasByPeriod?.[period.periodId] ?? materiasByPeriod?.[String(period.periodId)] ?? [];
    for (const materia of materias) {
      if (!materia?.id) continue;
      const key = historialPrevioRowKey(period.periodId, materia.id);
      rows.push({
        key,
        periodId: period.periodId,
        periodName: period.periodName,
        periodNumero: period.periodNumero,
        materiaId: materia.id,
        materiaSigla: materia.sigla,
        materiaNombre: materia.nombre,
        status: period.status,
        nota: gradesByKey[key] ?? null,
      });
    }
  }
  return rows;
}

export function buildPriorHistoryPayload(gradesByKey, concludedPeriods, materiasByPeriod) {
  const rows = buildHistorialPrevioRows(concludedPeriods, materiasByPeriod, gradesByKey);
  return rows
    .filter((r) => r.nota != null && r.nota !== '' && !Number.isNaN(Number(r.nota)))
    .map((r) => ({
      materia_id: r.materiaId,
      period_id: r.periodId,
      final_grade: Number(r.nota),
      status: r.status,
    }));
}

/**
 * Precarga notas desde priorEnrollmentHistories del API (detalle/edición).
 */
export function seedGradesFromPriorEnrollmentHistories(priorHistories = []) {
  const grades = {};
  if (!Array.isArray(priorHistories)) return grades;
  for (const h of priorHistories) {
    const periodId = h.periodoId ?? h.periodId ?? h.period_id;
    const materiaId = h.materiaId ?? h.materia_id;
    const nota = h.notaFinal ?? h.finalGrade ?? h.final_grade;
    if (periodId != null && materiaId != null && nota != null) {
      grades[historialPrevioRowKey(periodId, materiaId)] = Number(nota);
    }
  }
  return grades;
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

export function validateHistorialPrevioGrades(gradesByKey, concludedPeriods, materiasByPeriod) {
  const rows = buildHistorialPrevioRows(concludedPeriods, materiasByPeriod, gradesByKey);
  if (rows.length === 0) return { valid: true, missing: 0, invalid: [] };

  const invalid = [];
  let missing = 0;

  for (const row of rows) {
    const nota = row.nota;
    if (nota == null || nota === '') {
      missing += 1;
      continue;
    }
    const n = Number(nota);
    if (Number.isNaN(n) || n < 0 || n > 100) {
      invalid.push({ ...row, reason: 'La nota debe estar entre 0 y 100' });
    } else if (n < NOTA_MINIMA_APROBACION) {
      invalid.push({ ...row, reason: `La nota mínima de aprobación es ${NOTA_MINIMA_APROBACION}` });
    }
  }

  return {
    valid: missing === 0 && invalid.length === 0,
    missing,
    invalid,
    total: rows.length,
  };
}
