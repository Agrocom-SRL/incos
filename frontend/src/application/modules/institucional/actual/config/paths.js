/** Rutas del menú Institucional → Gestión actual. */

export const ACTUAL_BASE = '/institucional/actual';

export const actualPaths = {
  root: () => ACTUAL_BASE,
  bimestres: () => `${ACTUAL_BASE}/bimestres`,
  cronograma: () => `${ACTUAL_BASE}/cronograma`,
};
