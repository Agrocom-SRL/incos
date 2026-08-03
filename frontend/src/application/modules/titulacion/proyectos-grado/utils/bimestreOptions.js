/**
 * Catálogo fijo de bimestres (módulo TIT, Requisito 3 — extensión
 * 2026-07-31). El régimen académico institucional tiene 4 bimestres por
 * gestión (mismo criterio que `periodos_academicos` `division='BIMESTRE'`,
 * `numero_orden` 1-4); no hay endpoint de catálogo para esto, es una
 * constante de negocio.
 */
export const BIMESTRE_OPTIONS = [
  { value: 1, label: '1er bimestre' },
  { value: 2, label: '2do bimestre' },
  { value: 3, label: '3er bimestre' },
  { value: 4, label: '4to bimestre' },
];

export default BIMESTRE_OPTIONS;
