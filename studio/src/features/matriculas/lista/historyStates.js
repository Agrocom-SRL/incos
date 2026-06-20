/**
 * historyStates — estados de historial previo de la UI (píldoras + filtros).
 * Mapa PURO historialKey → { tone StatusPill, iconKey }. Sin React, sin i18n:
 * las etiquetas se traducen en el render por clave (enrollments.history.*).
 */
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

/** historialKey → { tone, iconKey } (icono resuelto vía HISTORY_ICONS). */
export const HISTORY_STATE_MAP = {
  pendiente: { tone: 'warn', iconKey: 'clock' },
  completo: { tone: 'ok', iconKey: 'check' },
  observado: { tone: 'err', iconKey: 'close' },
  revision: { tone: 'info', iconKey: 'eye' },
  no_aplica: { tone: 'neutral', iconKey: 'minus' },
};

/** iconKey → componente de icono (AntD). */
export const HISTORY_ICONS = {
  clock: ClockCircleOutlined,
  check: CheckCircleOutlined,
  close: CloseCircleOutlined,
  eye: EyeOutlined,
  minus: MinusCircleOutlined,
};

/** Resuelve el estado de un historialKey (fallback a 'completo'). */
export function historyStateOf(historialKey) {
  return HISTORY_STATE_MAP[historialKey] || HISTORY_STATE_MAP.completo;
}

/** Opciones del Select de filtro de historial (labelKey i18n: enrollments.history.*). */
export const HISTORY_FILTER_OPTIONS = [
  { value: 'pendiente', labelKey: 'enrollments.history.pendiente' },
  { value: 'completo', labelKey: 'enrollments.history.completo' },
  { value: 'no_aplica', labelKey: 'enrollments.history.no_aplica' },
];

export default HISTORY_STATE_MAP;
