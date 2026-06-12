import {
  calcularNotaFinalPonderada,
  notaEfectivaBimestre,
} from './cuadernoNotasCalculo.js';

/**
 * Recalcula matriculas_materia.nota_final para todos los estudiantes del curso.
 */
export async function recalcularNotaFinalMatriculaCurso({
  cuadernoRepository,
  subjectEnrollmentRepository,
  asignacionId,
  pesosBimestres,
  usuarioId,
}) {
  const filas = await cuadernoRepository.listarResumenNotasPorMatricula(Number(asignacionId));

  const porMatricula = new Map();
  for (const row of filas) {
    const mmId = Number(row.matricula_materia_id);
    if (!porMatricula.has(mmId)) {
      porMatricula.set(mmId, { bimestres: [], mmId });
    }
    const num = Number(row.bimestre);
    if (Number.isFinite(num) && num >= 1 && num <= 4) {
      porMatricula.get(mmId).bimestres.push({
        numero: num,
        nota: notaEfectivaBimestre(row),
      });
    }
  }

  let actualizados = 0;
  for (const { mmId, bimestres } of porMatricula.values()) {
    const notaFinal = calcularNotaFinalPonderada(bimestres, pesosBimestres);
    await subjectEnrollmentRepository.actualizarNotaFinalMatricula(mmId, notaFinal, usuarioId);
    actualizados += 1;
  }

  return { matriculasActualizadas: actualizados };
}
