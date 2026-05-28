/**
 * Mapa asignatura_plan_id → sigla del prerrequisito (para columnas año 2 y 3).
 */
export const buildPrerrequisitoSiglaMap = (periodos = [], prerrequisitos = []) => {
  const siglaByAsignaturaId = new Map();
  for (const periodo of periodos) {
    for (const asig of periodo.asignaturas ?? []) {
      if (asig?.id && asig?.materia?.sigla) {
        siglaByAsignaturaId.set(asig.id, asig.materia.sigla);
      }
    }
  }

  const prereqByAsignaturaId = new Map();
  for (const pr of prerrequisitos) {
    const asignaturaId = pr.asignatura_id ?? pr.asignaturaId;
    const prereqId = pr.prerrequisito_id ?? pr.prerrequisitoId;
    if (!asignaturaId || !prereqId) continue;
    const sigla = siglaByAsignaturaId.get(prereqId);
    if (sigla) {
      prereqByAsignaturaId.set(asignaturaId, sigla);
    }
  }

  return prereqByAsignaturaId;
};
