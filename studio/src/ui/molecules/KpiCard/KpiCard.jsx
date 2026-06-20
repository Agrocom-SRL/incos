/**
 * KpiCard — tarjeta de indicador con acento de color y count-up.
 * Molécula reutilizable: datos por props; acento vía CSS var --kpi-accent.
 */
import { useCountUp } from '@lib/motion/useCountUp';
import './KpiCard.css';

export function KpiCard({ label, value, icon, accent = 'var(--brand-600)', sub }) {
  const animated = useCountUp(Number(value) || 0);
  return (
    <div className="ds-kpi" style={{ '--kpi-accent': accent }}>
      <span className="ds-kpi__blob" aria-hidden />
      <div className="ds-kpi__head">
        <span className="ds-kpi__icon">{icon}</span>
        <span className="ds-kpi__label">{label}</span>
      </div>
      <div className="ds-kpi__value">{animated.toLocaleString('es-BO')}</div>
      {sub ? <div className="ds-kpi__sub">{sub}</div> : null}
    </div>
  );
}

export default KpiCard;
