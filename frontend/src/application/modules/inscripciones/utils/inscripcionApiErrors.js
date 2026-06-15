/**
 * Mensajes de error de API de inscripción sin exponer detalles SQL al usuario.
 */

const FK_MATRICULA_PATTERNS = [
  /foreign key constraint/i,
  /ER_NO_REFERENCED_ROW/i,
  /asignacion_docente_id/i,
  /matriculas_materia/i,
];

export function isMatriculaMateriasInfrastructureError(message, errorDetails) {
  const code = errorDetails?.code ?? errorDetails?.errorCode;
  if (code === 'MATRICULA_MATERIAS_INVALID') return true;
  const text = String(message ?? '');
  return FK_MATRICULA_PATTERNS.some((re) => re.test(text));
}

export function resolveInscripcionApiUserMessage(message, errorDetails) {
  if (isMatriculaMateriasInfrastructureError(message, errorDetails)) {
    return {
      message:
        'No se pudo registrar una o más materias: falta una asignación docente vigente para el paralelo y la gestión seleccionados. Revise periodo, paralelo y materias.',
      field: 'materiasPorPeriodo',
    };
  }

  const raw = String(message ?? '');
  if (FK_MATRICULA_PATTERNS.some((re) => re.test(raw))) {
    return {
      message:
        'No se pudo completar la inscripción por un problema con las materias seleccionadas. Revise periodo, paralelo y materias.',
      field: 'materiasPorPeriodo',
    };
  }

  return { message: raw || 'Error al guardar la inscripción', field: null };
}
