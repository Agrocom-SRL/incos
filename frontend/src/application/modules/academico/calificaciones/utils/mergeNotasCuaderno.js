/**
 * Fusiona notas del API con el listado de estudiantes del cuaderno.
 */

export const mergeNotasEnEstudiantes = (estudiantesBase, notasRows = []) => {
  const porId = new Map(
    estudiantesBase.map((e) => [e.id, { ...e, notas: { ...(e.notas ?? {}) } }]),
  );

  for (const fila of notasRows) {
    const est = porId.get(fila.estudianteId);
    if (!est) continue;
    if (fila.nota != null) {
      est.notas[fila.evaluacionId] = fila.nota;
    }
  }

  return [...porId.values()];
};
