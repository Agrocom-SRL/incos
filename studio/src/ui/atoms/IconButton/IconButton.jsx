/**
 * IconButton — botón de icono del chrome (topbar/acciones).
 * Átomo de presentación puro: recibe icono y handler; sin lógica de negocio.
 */
import './IconButton.css';

export function IconButton({ icon, label, onClick, badge, className = '' }) {
  return (
    <button
      type="button"
      className={`ds-icon-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="ds-icon-btn__glyph">{icon}</span>
      {badge ? <span className="ds-icon-btn__badge">{badge}</span> : null}
    </button>
  );
}

export default IconButton;
