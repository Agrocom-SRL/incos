export const FILTER_DEFAULTS = {
    carrera: 'all',
    periodo: 'all',
    turno: 'all',
};

/** Etiquetas del tablero / KPI (misma nomenclatura que columnas del kanban y tags en tabla). */
export const BOARD_COLUMN_LABELS = {
    sin_horarios: 'Sin horarios',
    sin_docentes: 'Sin docentes',
    sin_aulas: 'Sin aulas',
    completo: 'Completo',
};

/** Columnas del tablero (orden visual): sin horarios → sin docentes → sin aulas → completos. */
export const BOARD_COLUMNS = ['sin_horarios', 'sin_docentes', 'sin_aulas', 'completo'];

/** Orden alineado al tablero (KPI / columnas). */
export const STATUS_ORDER = BOARD_COLUMNS;
