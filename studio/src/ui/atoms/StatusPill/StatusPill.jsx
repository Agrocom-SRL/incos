/**
 * StatusPill — píldora de estado semántico (ok / warn / err / info / neutral).
 * Átomo puro: el `tone` mapea a una pareja de tokens bg/fg.
 */
import './StatusPill.css';

export function StatusPill({ tone = 'neutral', icon, children }) {
  return (
    <span className={`ds-pill ds-pill--${tone}`}>
      {icon ? <span className="ds-pill__icon">{icon}</span> : null}
      {children}
    </span>
  );
}

export default StatusPill;
