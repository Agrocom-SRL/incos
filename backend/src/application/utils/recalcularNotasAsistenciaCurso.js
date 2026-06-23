/**
 * Recalcula todas las celdas de UNA columna ASISTENCIA. @returns {Promise<number>} celdas escritas.
 */
async function recalcularColumnaAsistencia({
  asistenciaPlanillaViewRepository,
  subjectEnrollmentBimesterRepository,
  bimesterEvaluationGradeRepository,
  asignacionId,
  gestionId,
  bimestreNumero,
  usuarioId,
  columna
}) {
  const puntos = Math.round(Number(columna.puntos));
  if (!Number.isFinite(puntos) || puntos < 1) {
    return 0;
  }

  const filas = await asistenciaPlanillaViewRepository.listarAsistenciaBimestreCurso(
    asignacionId,
    Number(columna.periodoAcademicoId),
    gestionId,
    columna.fechaInicio,
    columna.fechaFin
  );

  const escrituras = (filas ?? []).map(async (fila) => {
    const estudianteId = Number(fila.estudiante_id);
    const sesionesTomadas = Number(fila.sesiones_tomadas) || 0;
    const faltas = Number(fila.faltas_no_neutralizadas) || 0;

    // Sin sesiones tomadas no se puede medir asistencia: la celda queda en 0.
    const porcentaje =
      sesionesTomadas > 0 ? Math.max(0, sesionesTomadas - faltas) / sesionesTomadas : 0;
    const nota = Math.round(porcentaje * puntos);

    const bimestreMatriculaId =
      await subjectEnrollmentBimesterRepository.asegurarBimestreMatriculaId(
        asignacionId,
        estudianteId,
        bimestreNumero,
        usuarioId
      );
    if (!bimestreMatriculaId) {
      return 0;
    }

    await bimesterEvaluationGradeRepository.upsertNotaCelda({
      evaluacionId: Number(columna.evaluacionId),
      bimestreMatriculaId: Number(bimestreMatriculaId),
      nota,
      usuarioId
    });
    return 1;
  });

  const resultados = await Promise.all(escrituras);
  return resultados.reduce((acc, n) => acc + n, 0);
}

/**
 * Recalcula las celdas de las columnas tipo ASISTENCIA del cuaderno de un curso en un
 * bimestre, ANTES de recalcular el práctico/bimestre.
 *
 * Para cada columna ASISTENCIA (componente PRACTICO) y cada estudiante del curso:
 *   %asistencia = (sesiones_tomadas - faltas_no_neutralizadas) / sesiones_tomadas
 *   nota        = round(%asistencia × puntos)   (PROPORCIONAL DIRECTO)
 * y hace upsert en evaluaciones_notas (celda evaluacion × bimestre_matricula).
 *
 * Si el curso no tiene columna ASISTENCIA, no hace nada. Si no hay sesiones tomadas,
 * la celda queda en 0 (no se puede medir asistencia todavía).
 *
 * @returns {Promise<{ columnasAsistencia:number, celdasAsistencia:number }>}
 */
export async function recalcularNotasAsistenciaCurso({
  cuadernoRepository,
  asistenciaPlanillaViewRepository,
  subjectEnrollmentBimesterRepository,
  bimesterEvaluationGradeRepository,
  asignacionId,
  gestionId,
  bimestreNumero,
  usuarioId
}) {
  const columnas = await cuadernoRepository.listarColumnasAsistenciaBimestre(
    Number(asignacionId),
    Number(gestionId),
    Number(bimestreNumero)
  );

  if (!columnas || columnas.length === 0) {
    return { columnasAsistencia: 0, celdasAsistencia: 0 };
  }

  const recuentosPorColumna = await Promise.all(
    columnas.map((columna) =>
      recalcularColumnaAsistencia({
        asistenciaPlanillaViewRepository,
        subjectEnrollmentBimesterRepository,
        bimesterEvaluationGradeRepository,
        asignacionId: Number(asignacionId),
        gestionId: Number(gestionId),
        bimestreNumero: Number(bimestreNumero),
        usuarioId,
        columna
      })
    )
  );

  const celdas = recuentosPorColumna.reduce((acc, n) => acc + n, 0);
  return { columnasAsistencia: columnas.length, celdasAsistencia: celdas };
}
