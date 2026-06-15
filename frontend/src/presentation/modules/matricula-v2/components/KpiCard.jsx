/**
 * Tarjeta KPI del listado v2.
 * @param {{
 *   label: string,
 *   value: number|string,
 *   delta?: number,
 *   icon: React.ReactNode,
 *   accent?: string,   // token de tema (ej. 'var(--brand-600)'), nunca hex suelto
 *   sub?: string
 * }} props
 */
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useCountUp } from '@presentation/hooks/useCountUp';

// useCountUp extraído a capa compartida (presentation/hooks/useCountUp.js).
// Fuente única de animación de números: presets EASE/DUR de presentation/motion/presets.js.

const KpiCard = ({ label, value, delta, icon, accent = 'var(--brand-600)', sub }) => {
  const positive = delta === undefined || delta >= 0;
  const displayValue = useCountUp(value);

  return (
    <div className="matricula-v2-kpi-card" style={{ '--kpi-accent': accent }}>
      <div className="matricula-v2-kpi-card__blob--lg" aria-hidden />
      <div className="matricula-v2-kpi-card__blob" aria-hidden />
      <div className="matricula-v2-kpi-card__rail" aria-hidden />

      <div className="matricula-v2-kpi-card__head">
        <div className="matricula-v2-kpi-card__icon">{icon}</div>
        <div className="matricula-v2-kpi-card__label">{label}</div>
      </div>

      <div className="matricula-v2-kpi-card__value-row">
        <div className="matricula-v2-kpi-card__value">{displayValue}</div>
        {delta !== undefined && (
          <div className="matricula-v2-kpi-card__delta" data-positive={positive}>
            {positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      {sub ? <div className="matricula-v2-kpi-card__sub">{sub}</div> : null}
    </div>
  );
};

export default KpiCard;
