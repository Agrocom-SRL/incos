/**
 * Suma de puntos por componente para el drawer de actividades del cuaderno.
 */

export const calcularSumaPuntosComponente = (
  evaluaciones,
  componente,
  puntosFormulario = 0,
  evaluacionIdExcluir = null,
) => {
  const sumaExistente = (evaluaciones ?? [])
    .filter((e) => e.componente === componente && e.id !== evaluacionIdExcluir)
    .reduce((acc, e) => acc + Math.round(Number(e.puntos || 0)), 0);

  return sumaExistente + Math.round(Number(puntosFormulario || 0));
};

export const contarNotasCargadas = (estudiantes, evaluacionId) =>
  (estudiantes ?? []).filter(
    (e) => e.notas?.[evaluacionId] != null && e.notas?.[evaluacionId] !== '',
  ).length;
