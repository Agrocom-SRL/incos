export const PERM_ASIGNACION_DOCENTE = 'institucional.horarios.asignacion-docente';
export const PERM_COLOR_DOCENTE = 'institucional.horarios.color-docente';
export const PERM_CARGA_DOCENTE = 'institucional.horarios.carga-docente';
export const PERM_ASIGNACION_LEGACY = 'docentes.asignar';

export function canListarAsignacion(hasPermiso) {
  return (
    hasPermiso(PERM_ASIGNACION_DOCENTE, 'LISTAR') ||
    hasPermiso(PERM_ASIGNACION_LEGACY, 'EDITAR')
  );
}

export function canEditarAsignacion(hasPermiso) {
  return (
    hasPermiso(PERM_ASIGNACION_DOCENTE, 'EDITAR') ||
    hasPermiso(PERM_ASIGNACION_DOCENTE, 'CREAR') ||
    hasPermiso(PERM_ASIGNACION_LEGACY, 'EDITAR') ||
    hasPermiso(PERM_ASIGNACION_LEGACY, 'CREAR')
  );
}

export function canEliminarAsignacion(hasPermiso) {
  return (
    hasPermiso(PERM_ASIGNACION_DOCENTE, 'ELIMINAR') ||
    hasPermiso(PERM_ASIGNACION_LEGACY, 'ELIMINAR')
  );
}

export function canGestionarColor(hasPermiso) {
  return (
    hasPermiso(PERM_COLOR_DOCENTE, 'EDITAR') ||
    hasPermiso(PERM_ASIGNACION_DOCENTE, 'EDITAR') ||
    hasPermiso(PERM_ASIGNACION_LEGACY, 'EDITAR')
  );
}

export function canVerCarga(hasPermiso) {
  return (
    hasPermiso(PERM_CARGA_DOCENTE, 'LISTAR') ||
    hasPermiso(PERM_ASIGNACION_DOCENTE, 'LISTAR') ||
    hasPermiso(PERM_ASIGNACION_LEGACY, 'EDITAR')
  );
}
