/**
 * Chip de filtro (átomo). Gemelo único para el chip "Todas" y los de carrera:
 * mismas dimensiones, radio, transiciones y feedback de press.
 * @param {{
 *   label: string,
 *   count: number,
 *   active: boolean,
 *   onClick: () => void,
 *   color?: string,    // color de negocio (carrera); se sanitiza
 *   showDot?: boolean, // el chip "Todas" no muestra punto de color
 * }} props
 */
import { sanitizeBusinessColor } from '../utils/sanitizeColor';

const CareerChip = ({ label, count, active, onClick, color, showDot = true }) => {
  const chipColor = sanitizeBusinessColor(color, 'var(--brand-700)');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`matricula-v2-chip${active ? ' matricula-v2-chip--active' : ''}`}
      style={{ '--chip-color': chipColor }}
    >
      {showDot ? <span className="matricula-v2-chip__dot" aria-hidden /> : null}
      {label}
      <span className="matricula-v2-chip__count">{count}</span>
    </button>
  );
};

export default CareerChip;
