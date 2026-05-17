/**
 * Valores por defecto al persistir asignaciones_docentes cuando el cliente no envía fecha/carga.
 */

/**
 * Fecha calendario YYYY-MM-DD en hora local del proceso Node.
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function todayDateOnlyLocal(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Redondea horas_semanales del plan para usar como carga_horaria por defecto.
 * @param {unknown} weeklyHours
 * @returns {number|null}
 */
export function defaultWeeklyHoursFromPlan(weeklyHours) {
  if (weeklyHours == null || weeklyHours === '') return null;
  const n = Number(weeklyHours);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}
