/**
 * DTO de evaluaciones del cuaderno para la API.
 */

export const mapEvaluacionEntityToDto = (entity) => {
  const p = entity?.toPlainObject?.() ?? entity ?? {};
  return {
    id: p.id,
    tipoEvaluacionId: p.evaluationTypeId ?? null,
    nombre: p.evaluationName ?? '',
    componente: p.component ?? 'PRACTICO',
    peso: p.weight != null ? Number(p.weight) : null,
    fecha: p.date ?? null,
    notasCerradas: Boolean(p.gradesClosed),
  };
};

export const mapNotaRowToDto = (row) => ({
  estudianteId: Number(row.estudiante_id),
  evaluacionId: Number(row.evaluacion_id),
  nota: row.nota != null ? Number(row.nota) : null,
});
