/**
 * Convierte periodos×asignaturas del API en filas (materia) × columnas (periodo).
 */

export const buildAsignaturaCatalog = (periodos = []) => {
  const catalog = [];
  for (const periodo of periodos) {
    for (const asig of periodo.asignaturas ?? []) {
      catalog.push({
        id: asig.id,
        periodoId: periodo.id,
        periodoNumero: periodo.numero,
        periodoNombre: periodo.nombre,
        sigla: asig.materia?.sigla,
        nombre: asig.materia?.nombre,
        tipo: asig.materia?.tipo,
        horas_semanales: asig.horas_semanales,
        modalidad: asig.modalidad,
        orden_visualizacion: asig.orden_visualizacion,
        label: `${asig.materia?.sigla ?? '?'} — ${asig.materia?.nombre ?? ''} (${periodo.nombre ?? `P${periodo.numero}`})`,
      });
    }
  }
  return catalog;
};

export const buildPlanMatrizRows = (periodos = []) => {
  const rowMap = new Map();

  for (const periodo of periodos) {
    for (const asig of periodo.asignaturas ?? []) {
      const sigla = asig.materia?.sigla ?? `id-${asig.id}`;
      if (!rowMap.has(sigla)) {
        rowMap.set(sigla, {
          key: sigla,
          materia: asig.materia ?? {},
          cells: {},
        });
      }
      rowMap.get(sigla).cells[periodo.id] = {
        ...asig,
        periodoId: periodo.id,
        periodoNumero: periodo.numero,
      };
    }
  }

  return [...rowMap.values()].sort((a, b) =>
    (a.materia?.sigla ?? '').localeCompare(b.materia?.sigla ?? '', undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
};
