/**
 * Estados de licencias estudiantiles (espejo de ESTADOS_LICENCIAS del backend).
 * @see backend/src/domain/constants/licencias.constants.js
 */
export const ESTADOS_LICENCIA = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
};

/** Etiqueta legible por estado. */
export const ESTADO_LICENCIA_LABEL = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada',
};

/**
 * Color del Tag de Ant Design por estado (mapea al token de estado del theme):
 * PENDIENTE ámbar (warning), APROBADA verde (success), RECHAZADA rojo (error),
 * CANCELADA gris (default). El Tag resuelve estos nombres contra el ConfigProvider.
 */
export const ESTADO_LICENCIA_TAG_COLOR = {
  PENDIENTE: 'warning',
  APROBADA: 'success',
  RECHAZADA: 'error',
  CANCELADA: 'default',
};

/** Opciones para el filtro de estado del listado. */
export const ESTADO_LICENCIA_OPTIONS = Object.values(ESTADOS_LICENCIA).map((value) => ({
  value,
  label: ESTADO_LICENCIA_LABEL[value] ?? value,
}));

export const formatEstadoLicencia = (estado) => ESTADO_LICENCIA_LABEL[estado] ?? estado ?? '—';
export const tagColorEstadoLicencia = (estado) => ESTADO_LICENCIA_TAG_COLOR[estado] ?? 'default';
