/**
 * Helper de aplicación: resumen académico por estudiante para los listados
 * (landing enriquecida del Historial académico — docs/plan/HISTORIAL-ACADEMICO.md).
 *
 * Consulta vista_estudiante_resumen_academico (143) vía
 * StudentAcademicDataRepository.obtenerResumenAcademicoPorEstudianteIds y expone
 * un mapa estudianteId → { periodoActualNumero, periodoActualNombre,
 * paraleloActual, promedioHistorial } (camelCase, contrato aditivo).
 *
 * Compartido por ListStudentsUseCase y SearchStudentUseCase para que list y
 * search entreguen los MISMOS nombres de campo.
 */

/** Campos por defecto cuando el estudiante no tiene fila en la vista resumen. */
export const RESUMEN_ACADEMICO_VACIO = Object.freeze({
  periodoActualNumero: null,
  periodoActualNombre: null,
  paraleloActual: null,
  promedioHistorial: null,
});

/**
 * Construye el mapa estudianteId → resumen académico (camelCase).
 *
 * @param {Object} studentAcademicDataRepository - Repo con obtenerResumenAcademicoPorEstudianteIds
 * @param {Array<number>} studentIds - IDs de estudiantes
 * @returns {Promise<Object<number, Object>>} Mapa id → resumen (vacío si no hay repo/ids)
 */
export async function buildResumenAcademicoByStudentId(studentAcademicDataRepository, studentIds) {
  const map = {};
  const ids = (studentIds || []).filter((id) => id != null);
  if (ids.length === 0 || !studentAcademicDataRepository?.obtenerResumenAcademicoPorEstudianteIds) {
    return map;
  }

  const rows = await studentAcademicDataRepository.obtenerResumenAcademicoPorEstudianteIds(ids);
  (rows || []).forEach((row) => {
    if (row?.estudiante_id == null) return;
    map[row.estudiante_id] = {
      periodoActualNumero: row.periodo_actual_numero ?? null,
      periodoActualNombre: row.periodo_actual_nombre ?? null,
      paraleloActual: row.paralelo_actual ?? null,
      promedioHistorial: row.promedio_historial != null ? Number(row.promedio_historial) : null,
    };
  });
  return map;
}

/**
 * Aplica el resumen académico (4 campos aditivos) a cada item del listado.
 *
 * @param {Array<Object>} items - Items en formato de presentación (con .id)
 * @param {Object<number, Object>} resumenByStudentId - Mapa de buildResumenAcademicoByStudentId
 * @returns {Array<Object>} Items con los campos del resumen añadidos
 */
export function applyResumenAcademico(items, resumenByStudentId) {
  return (items || []).map((item) => ({
    ...item,
    ...(resumenByStudentId[item?.id] ?? RESUMEN_ACADEMICO_VACIO),
  }));
}
