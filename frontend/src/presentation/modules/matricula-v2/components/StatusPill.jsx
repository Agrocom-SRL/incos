/**
 * Píldora de estado de historial previo.
 * @param {{ statusKey: string, label?: string }} props
 */
import {
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
  SyncOutlined,
} from '@ant-design/icons';

const STATUS_MAP = {
  pendiente: {
    bg: 'var(--pill-warn-bg)',
    color: 'var(--pill-warn-fg)',
    icon: <ClockCircleFilled />,
  },
  completo: {
    bg: 'var(--pill-ok-bg)',
    color: 'var(--pill-ok-fg)',
    icon: <CheckCircleFilled />,
  },
  observado: {
    bg: 'var(--pill-err-bg)',
    color: 'var(--pill-err-fg)',
    icon: <ExclamationCircleFilled />,
  },
  revision: {
    bg: 'var(--pill-info-bg)',
    color: 'var(--pill-info-fg)',
    icon: <SyncOutlined spin />,
  },
  no_aplica: {
    bg: 'var(--surface-alt)',
    color: 'var(--text-muted)',
    icon: <CheckCircleFilled />,
  },
};

const StatusPill = ({ statusKey, label }) => {
  const m = STATUS_MAP[statusKey] || STATUS_MAP.completo;
  const text = label || statusKey;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: m.bg,
        color: m.color,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: 11, display: 'inline-flex' }}>{m.icon}</span>
      {text}
    </span>
  );
};

export default StatusPill;
