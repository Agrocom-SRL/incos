export * from './context';
export * from './hooks';
export * from './providers';
export {
    paraleloScheduleToCourseSchedules,
    unwrapParaleloSchedulePayload,
    extractParaleloScheduleMeta,
} from './utils/paraleloScheduleToCourseSchedules';
export {
    PERM_ASIGNACION_DOCENTE,
    PERM_COLOR_DOCENTE,
    PERM_CARGA_DOCENTE,
    canListarAsignacion,
    canEditarAsignacion,
    canEliminarAsignacion,
    canGestionarColor,
    canVerCarga,
} from './config/asignacionDocentePermisos';
