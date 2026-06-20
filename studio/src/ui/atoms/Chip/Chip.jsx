/**
 * Chip — píldora filtrable (p. ej. carreras). Átomo: estado activo + color por prop.
 */
import './Chip.css';

export function Chip({ label, count, color = 'var(--brand-600)', active = false, showDot = true, onClick }) {
  return (
    <button
      type="button"
      className={`ds-chip${active ? ' ds-chip--active' : ''}`}
      style={{ '--chip-color': color }}
      onClick={onClick}
      aria-pressed={active}
    >
      {showDot ? <span className="ds-chip__dot" aria-hidden /> : null}
      <span>{label}</span>
      {typeof count === 'number' ? <span className="ds-chip__count">{count}</span> : null}
    </button>
  );
}

export default Chip;
