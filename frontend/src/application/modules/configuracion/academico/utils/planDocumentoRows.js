/**
 * Filas alineadas entre columnas de años (misma altura visual).
 */

export const getMaxAsignaturasPorPeriodo = (periodos = []) =>
  periodos.reduce((max, p) => Math.max(max, p.asignaturas?.length ?? 0), 0);

export const padAsignaturasPeriodo = (asignaturas = [], targetCount) => {
  const list = [...asignaturas];
  while (list.length < targetCount) {
    list.push({
      id: `__pad_${list.length}`,
      _placeholder: true,
      materia: null,
      horas_semanales: null,
    });
  }
  return list;
};

/** Clase CSS según longitud del nombre de materia. */
export const materiaNombreSizeClass = (nombre) => {
  const len = String(nombre ?? '').trim().length;
  if (len > 48) return 'cfg-plan-doc__td-nombre--xs';
  if (len > 36) return 'cfg-plan-doc__td-nombre--sm';
  if (len > 26) return 'cfg-plan-doc__td-nombre--md';
  return '';
};
