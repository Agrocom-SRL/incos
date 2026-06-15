/**
 * Límites de listado INCOS (evitar cargas masivas en RAM).
 * El backend pagina por defecto (50); antes se usaba limit 10000 para filtrar en cliente.
 */

/** Página por defecto en peticiones GET listado */
export const DEFAULT_LIST_PAGE = 1;

/** Tamaño de página por defecto (listados con paginación en servidor) */
export const DEFAULT_LIST_LIMIT = 50;

/** Catálogos CFG / selects (carreras, materias, paralelos maestro) — suele ser < 500 ítems */
export const CATALOG_LIST_LIMIT = 500;

/** Máximo por petición en listados paginados en servidor */
export const MAX_LIST_PAGE_SIZE = 100;

export const LIST_PAGE_SIZE_OPTIONS = ['10', '20', '50', String(MAX_LIST_PAGE_SIZE)];
