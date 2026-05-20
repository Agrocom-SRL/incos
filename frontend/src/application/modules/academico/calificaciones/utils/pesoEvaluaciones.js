/**
 * Suma de pesos por componente para el drawer de evaluaciones.
 */

export const calcularSumaPesosComponente = (
  evaluaciones,
  componente,
  pesoFormulario = 0,
  evaluacionIdExcluir = null,
) => {
  const sumaExistente = (evaluaciones ?? [])
    .filter((e) => e.componente === componente && e.id !== evaluacionIdExcluir)
    .reduce((acc, e) => acc + Number(e.peso || 0), 0);

  return Math.round((sumaExistente + Number(pesoFormulario || 0)) * 100) / 100;
};

export const contarNotasCargadas = (estudiantes, evaluacionId) =>
  (estudiantes ?? []).filter(
    (e) => e.notas?.[evaluacionId] != null && e.notas?.[evaluacionId] !== '',
  ).length;
