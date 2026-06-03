export const FILTER_DEFAULTS = {
    carrera: 'all',
    periodo: 'all',
    turno: 'all',
};

/** Etiquetas del tablero / KPI (misma nomenclatura que columnas del kanban y tags en tabla). */
export const BOARD_COLUMN_LABELS = {
    sin_aulas: 'Sin aulas',
    sin_docentes: 'Sin docentes',
    sin_horarios: 'Sin horarios',
    completo: 'Completo',
};

/** Tablero kanban: solo grupos con pendientes (sin columna completo). Prioridad: aulas → docentes → horarios. */
export const BOARD_COLUMNS = ['sin_aulas', 'sin_docentes', 'sin_horarios'];

/** Orden de las 4 KPI del dashboard (incluye completos). */
export const KPI_STRIP_ORDER = ['completo', 'sin_aulas', 'sin_docentes', 'sin_horarios'];

/** Orden alineado al tablero + completo en tabla. */
export const STATUS_ORDER = [...BOARD_COLUMNS, 'completo'];
