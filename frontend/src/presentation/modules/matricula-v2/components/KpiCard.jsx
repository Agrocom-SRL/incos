/**
 * Tarjeta KPI del listado v2.
 * @param {{ label: string, value: number|string, delta?: number, icon: React.ReactNode, accent: string, sub?: string }} props
 */
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const KpiCard = ({ label, value, delta, icon, accent, sub }) => {
  const positive = delta === undefined || delta >= 0;

  return (
    <div
      className="matricula-v2-kpi-card"
      style={{
        background: 'var(--surface)',
        borderRadius: 14,
        padding: '18px 20px',
        border: '1px solid var(--border)',
        flex: '1 1 200px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: accent,
          opacity: 0.13,
          filter: 'blur(2px)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: accent,
          opacity: 0.22,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accent,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: accent,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: `0 4px 10px ${accent}40`,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: -0.5,
          }}
        >
          {value}
        </div>
        {delta !== undefined && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: positive ? 'var(--success)' : 'var(--danger)',
              background: positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
              padding: '3px 8px',
              borderRadius: 6,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      {sub ? <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>{sub}</div> : null}
    </div>
  );
};

export default KpiCard;
