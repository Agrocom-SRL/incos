/** Rutas del menú Institucional → Gestión actual. */

export const ACTUAL_BASE = '/institucional/actual';

export const actualPaths = {
  root: () => ACTUAL_BASE,
  bimestres: () => `${ACTUAL_BASE}/bimestres`,
  cronograma: () => `${ACTUAL_BASE}/cronograma`,
  cronogramaNueva: () => `${ACTUAL_BASE}/cronograma/nueva`,
  cronogramaDetalle: (id) => `${ACTUAL_BASE}/cronograma/${id}`,
  cronogramaEditar: (id) => `${ACTUAL_BASE}/cronograma/${id}/editar`,
};
