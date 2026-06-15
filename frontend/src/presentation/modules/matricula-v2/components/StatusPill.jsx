/**
 * Píldora de estado de historial previo (átomo).
 * Estilo en CSS (`matricula-v2-status-pill`), el mapa de estados es sólo datos.
 * @param {{ statusKey: string, label?: string }} props
 */
import {
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
  SyncOutlined,
} from '@ant-design/icons';

const STATUS_MAP = {
  pendiente: { icon: <ClockCircleFilled /> },
  completo: { icon: <CheckCircleFilled /> },
  observado: { icon: <ExclamationCircleFilled /> },
  // Icono estático: un spinner perpetuo por fila sería ruido visual (Emil).
  revision: { icon: <SyncOutlined /> },
  no_aplica: { icon: <CheckCircleFilled /> },
};

const StatusPill = ({ statusKey, label }) => {
  const key = STATUS_MAP[statusKey] ? statusKey : 'completo';
  const text = label || statusKey;

  return (
    <span className={`matricula-v2-status-pill matricula-v2-status-pill--${key}`}>
      <span className="matricula-v2-status-pill__icon">{STATUS_MAP[key].icon}</span>
      {text}
    </span>
  );
};

export default StatusPill;
