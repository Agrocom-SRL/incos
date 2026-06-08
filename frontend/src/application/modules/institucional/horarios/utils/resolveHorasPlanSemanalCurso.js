/**
 * Carga semanal de referencia para cobertura / generación de bloques.
 * Fuente de verdad: asignaturas_plan.horas_semanales (1 h plan = 1 bloque de 45 min).
 */
export function resolveHorasPlanSemanalCurso(course, coberturaRow = null) {
    const fromCourse =
        course?.horasSemanalesPlan != null && Number(course.horasSemanalesPlan) > 0
            ? Number(course.horasSemanalesPlan)
            : null;
    const fromCobertura =
        coberturaRow?.horasRequeridas != null && Number(coberturaRow.horasRequeridas) > 0
            ? Number(coberturaRow.horasRequeridas)
            : null;
    return fromCourse ?? fromCobertura ?? null;
}
