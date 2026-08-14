/**
 * Utilidades para historial de notas al inscribir (tabla historial_previo).
 */

const TIPOS_CON_HISTORIAL = ['ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'];

/** Fallback local si el contexto aún no informa la nota mínima de aprobación. */
export const DEFAULT_NOTA_HISTORIAL = 61;
export const HISTORIAL_ESTADOS = ['APROBADO', 'CONVALIDADO'];

/**
 * Nota que se precarga al cambiar una fila a APROBADO (§4-C4): la nota mínima
 * de aprobación que informa el contexto de matrícula, con fallback local.
 */
export function resolveDefaultNotaHistorial(contexto = null) {
  const nota = Number(contexto?.notaMinimaAprobacion);
  return Number.isFinite(nota) && nota > 0 ? nota : DEFAULT_NOTA_HISTORIAL;
}

/**
 * Determina si el wizard debe pedir el historial de notas al inscribir.
 *
 * @param {string|null} tipoAdmision - NUEVO | ANTIGUO | TRASPASO | TRANSITABILIDAD
 * @param {boolean|null} [esNuevoSistema] - true = 0 inscripciones en el sistema (vista 153
 *   ampliada / contexto-matricula). Con historial digital (false) el paso se omite:
 *   las notas ya viven en el kardex. Si el dato no está (null/undefined) se preserva
 *   el comportamiento histórico: decidir solo por tipo de admisión.
 */
export function requiereHistorialPrevio(tipoAdmision, esNuevoSistema = null) {
  if (esNuevoSistema === false) return false;
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

/** Ids de materia marcadas en un periodo, como Set de números. */
function selectedMateriaIdSet(selectedMateriaIdsByPeriod, periodId) {
  const ids =
    selectedMateriaIdsByPeriod?.[periodId] ?? selectedMateriaIdsByPeriod?.[String(periodId)] ?? [];
  return new Set((Array.isArray(ids) ? ids : []).map(Number).filter(Number.isFinite));
}

/**
 * Alcance del historial de notas (nivelación): periodos cuyas materias NO
 * cursadas en esta gestión deben quedar registradas con nota o convalidación.
 *
 * Regla (2026-08-14): el grano es la MATERIA, no el periodo completo. Un
 * estudiante de nivelación puede arrastrar materias de un periodo y cursar
 * otras de uno superior, o llevar solo algunas del primero; todo lo que no
 * lleva en esta gestión —hasta el periodo más alto que sí cursa— necesita
 * historial. Por eso cada periodo del alcance expone `selectedMateriaIds`:
 * las materias marcadas en la planilla se excluyen de sus filas.
 *
 * - Periodos anteriores al mínimo seleccionado → entran completos (nada marcado).
 * - Periodos entre el mínimo y el máximo seleccionado (incluidos) → entran con
 *   sus materias marcadas excluidas; si están todas marcadas no generan filas.
 * - TRASPASO: además los periodos bloqueados por `anio_cursado`.
 */
export function computeConcludedPeriods({
  tipoAdmision,
  periodos = [],
  selectedPeriodIds = [],
  periodosDisabledByTraspaso = null,
  selectedMateriaIdsByPeriod = null,
}) {
  const tipo = String(tipoAdmision ?? '').toUpperCase();
  if (!requiereHistorialPrevio(tipo) || !periodos.length) return [];

  const selected = periodos.filter((p) =>
    selectedPeriodIds.some((id) => Number(id) === Number(p.id))
  );
  const numerosSeleccionados = selected.map((p) => Number(p.numero ?? p.id) || 999);
  const minSelectedNumero = numerosSeleccionados.length ? Math.min(...numerosSeleccionados) : null;
  const maxSelectedNumero = numerosSeleccionados.length ? Math.max(...numerosSeleccionados) : null;

  return periodos
    .map((p) => {
      const numero = Number(p.numero ?? 0);
      const bloqueadoPorTraspaso =
        tipo === 'TRASPASO' && periodosDisabledByTraspaso?.[numero] === true;
      // Hasta el periodo más alto que cursa: lo no marcado ahí ya está vencido.
      const dentroDelAlcance = maxSelectedNumero != null && numero <= maxSelectedNumero;
      if (!bloqueadoPorTraspaso && !dentroDelAlcance) return null;

      // Los periodos bloqueados o previos al mínimo entran completos; en los que
      // el estudiante cursa se excluyen solo las materias que sí lleva.
      const excluirSeleccionadas =
        !bloqueadoPorTraspaso && minSelectedNumero != null && numero >= minSelectedNumero;

      return {
        periodId: p.id,
        periodNumero: numero,
        periodName: p.nombre || `Periodo ${numero}`,
        // Default por fila (§4-C4): CONVALIDADO; el usuario cambia a APROBADO
        // cuando corresponde y ahí se precarga la nota mínima de aprobación.
        status: 'CONVALIDADO',
        selectedMateriaIds: excluirSeleccionadas
          ? [...selectedMateriaIdSet(selectedMateriaIdsByPeriod, p.id)]
          : [],
      };
    })
    .filter(Boolean);
}

/**
 * Materias de un periodo del alcance que SÍ piden historial: las del plan menos
 * las que el estudiante cursa en esta gestión (`period.selectedMateriaIds`).
 */
export function listHistorialMateriasDePeriodo(period, materiasByPeriod) {
  const materias =
    materiasByPeriod?.[period?.periodId] ?? materiasByPeriod?.[String(period?.periodId)] ?? [];
  const cursadas = new Set((period?.selectedMateriaIds ?? []).map(Number));
  return materias.filter((materia) => materia?.id && !cursadas.has(Number(materia.id)));
}

export function historialPrevioRowKey(periodId, materiaId) {
  return `${periodId}:${materiaId}`;
}

export function parseHistorialPrevioRowKey(key) {
  const [periodId, materiaId] = String(key).split(':');
  return { periodId: Number(periodId), materiaId: Number(materiaId) };
}

export function resolveRowStatus(statusByKey, key, defaultStatus) {
  const s = String(statusByKey?.[key] ?? defaultStatus ?? 'CONVALIDADO').toUpperCase();
  return HISTORIAL_ESTADOS.includes(s) ? s : 'CONVALIDADO';
}

export function buildHistorialPrevioRows(
  concludedPeriods,
  materiasByPeriod,
  gradesByKey = {},
  statusByKey = {}
) {
  const rows = [];
  for (const period of concludedPeriods) {
    for (const materia of listHistorialMateriasDePeriodo(period, materiasByPeriod)) {
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
    // Nota 0-100 solo en APROBADO; CONVALIDADO va sin nota (§4-C4).
    if (row.status !== 'APROBADO') continue;

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
