/** Estados de historial previo para la UI v2 (píldoras y filtros). */

export const HISTORY_STATES = {
  pendiente: { key: 'pendiente', label: 'Historial pendiente', color: 'warning' },
  completo: { key: 'completo', label: 'Historial completo', color: 'success' },
  observado: { key: 'observado', label: 'Observado', color: 'error' },
  revision: { key: 'revision', label: 'En revisión', color: 'processing' },
  no_aplica: { key: 'no_aplica', label: 'Sin historial previo', color: 'default' },
};

/**
 * Mapea historialPrevioEstado del API al key de UI.
 * @param {string} estado
 */
export function mapHistorialEstado(estado) {
  switch (String(estado ?? '').toUpperCase()) {
    case 'PENDIENTE':
      return 'pendiente';
    case 'REGISTRADO':
      return 'completo';
    case 'NO_APLICA':
      return 'no_aplica';
    default:
      return 'completo';
  }
}

export const HISTORY_FILTER_OPTIONS = [
  { value: 'pendiente', label: 'Historial pendiente' },
  { value: 'completo', label: 'Historial completo' },
  { value: 'no_aplica', label: 'Sin historial previo' },
];
