/**
 * Átomo: pill de estado o categoría (clases CSS externas, p. ej. cfg-materia-pill--*).
 */

const StatusPill = ({ label, className = 'cfg-materia-pill cfg-materia-pill--default' }) => {
  if (!label) return <span className="cfg-materia-pill cfg-materia-pill--default">—</span>;
  return <span className={className}>{label}</span>;
};

export default StatusPill;
