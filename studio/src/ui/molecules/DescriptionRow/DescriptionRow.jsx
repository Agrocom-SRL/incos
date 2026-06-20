/**
 * DescriptionRow — fila etiqueta/valor (label a la izquierda, valor a la derecha).
 * Molécula reutilizable por tarjetas y fichas de detalle. Oculta valores vacíos.
 */
import './DescriptionRow.css';

export function DescriptionRow({ label, value }) {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className="ds-desc-row">
      <span className="ds-desc-row__label">{label}</span>
      <span className="ds-desc-row__value">{value}</span>
    </div>
  );
}

export default DescriptionRow;
