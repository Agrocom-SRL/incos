import { ForbiddenError, NotFoundError, ValidationError } from '../../domain/errors/AppError.js';
import { mapNotaRowToDto } from '../mappers/cuadernoEvaluacionMapper.js';

/**
 * Valida y persiste una celda del cuaderno (upsert o soft-delete).
 */
export async function persistirNotaCuadernoCelda({
  cuadernoRepository,
  asignacionId,
  bimestreNum,
  gestionId,
  estudianteId,
  evaluacionId,
  notaRaw,
  usuarioId,
}) {
  let nota = notaRaw;
  if (nota === '' || nota === undefined) {
    nota = null;
  }
  if (nota != null) {
    const n = Number(nota);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      throw new ValidationError('La nota debe estar entre 0 y 100');
    }
    nota = Math.round(n * 100) / 100;
  }

  const evaluacion = await cuadernoRepository.obtenerEvaluacionDeAsignacion(
    evaluacionId,
    Number(asignacionId),
  );
  if (!evaluacion) {
    throw new NotFoundError('Evaluación');
  }
  if (evaluacion.notas_cerradas) {
    throw new ForbiddenError('Las notas de esta evaluación están cerradas.');
  }

  const periodoId = await cuadernoRepository.obtenerPeriodoAcademicoId(gestionId, bimestreNum);
  if (!periodoId || Number(evaluacion.periodo_academico_id) !== Number(periodoId)) {
    throw new ValidationError(
      'La evaluación no corresponde al bimestre indicado (periodo académico).',
    );
  }

  const bimestreMatriculaId = await cuadernoRepository.obtenerBimestreMatriculaId(
    Number(asignacionId),
    estudianteId,
    bimestreNum,
  );
  if (!bimestreMatriculaId) {
    throw new NotFoundError('Matrícula del estudiante en este curso y bimestre');
  }

  if (nota == null) {
    await cuadernoRepository.eliminarNotaCelda(evaluacionId, bimestreMatriculaId, usuarioId);
    return mapNotaRowToDto({
      estudiante_id: estudianteId,
      evaluacion_id: evaluacionId,
      nota: null,
    });
  }

  const fila = await cuadernoRepository.upsertNotaCelda({
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
