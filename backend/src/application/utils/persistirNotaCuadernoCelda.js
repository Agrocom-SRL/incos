import { ForbiddenError, NotFoundError, ValidationError } from '../../domain/errors/AppError.js';
import { mapNotaRowToDto } from '../mappers/cuadernoEvaluacionMapper.js';

/**
 * Valida y persiste una celda del cuaderno (upsert o soft-delete).
 */
export async function persistirNotaCuadernoCelda({
  cuadernoRepository,
  subjectEnrollmentBimesterRepository,
  bimesterEvaluationGradeRepository,
  asignacionId,
  bimestreNum,
  gestionId,
  estudianteId,
  evaluacionId,
  notaRaw,
  usuarioId,
  reabierto = false,
}) {
  let nota = notaRaw;
  if (nota === '' || nota === undefined) {
    nota = null;
  }

  const evaluacion = await cuadernoRepository.obtenerEvaluacionDeAsignacion(
    evaluacionId,
    Number(asignacionId),
  );
  if (!evaluacion) {
    throw new NotFoundError('Evaluación');
  }
  // Un bimestre reabierto administrativamente vuelve editable aunque sus notas estén cerradas.
  if (evaluacion.notas_cerradas && !reabierto) {
    throw new ForbiddenError('Las notas de esta evaluación están cerradas.');
  }

  const puntosMax = Math.round(Number(evaluacion.puntos));
  if (!Number.isFinite(puntosMax) || puntosMax < 1) {
    throw new ValidationError('La actividad no tiene puntos configurados');
  }

  if (nota != null) {
    const n = Number(nota);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > puntosMax) {
      throw new ValidationError(
        `La nota debe ser un entero entre 0 y ${puntosMax} (puntos de la actividad)`,
      );
    }
    nota = n;
  }

  const periodoId = await cuadernoRepository.obtenerPeriodoAcademicoId(gestionId, bimestreNum);
  if (!periodoId || Number(evaluacion.periodo_academico_id) !== Number(periodoId)) {
    throw new ValidationError(
      'La evaluación no corresponde al bimestre indicado (periodo académico).',
    );
  }

  const bimestreMatriculaId = await subjectEnrollmentBimesterRepository.asegurarBimestreMatriculaId(
    Number(asignacionId),
    estudianteId,
    bimestreNum,
    usuarioId,
  );
  if (!bimestreMatriculaId) {
    throw new NotFoundError('Matrícula del estudiante en este curso y bimestre');
  }

  if (nota == null) {
    await bimesterEvaluationGradeRepository.eliminarNotaCelda(evaluacionId, bimestreMatriculaId, usuarioId);
    return mapNotaRowToDto({
      estudiante_id: estudianteId,
      evaluacion_id: evaluacionId,
      nota: null,
    });
  }

  const fila = await bimesterEvaluationGradeRepository.upsertNotaCelda({
    evaluacionId,
    bimestreMatriculaId,
    nota,
    usuarioId,
  });

  return mapNotaRowToDto({
    estudiante_id: estudianteId,
    evaluacion_id: evaluacionId,
    nota: fila.nota,
  });
}
