/**
 * Stat — métrica compacta (valor + etiqueta). Átomo puro reutilizable
 * (tarjetas, fichas, resúmenes). `accent` resalta el valor con el color de marca.
 */
import './Stat.css';

export function Stat({ value, label, accent = false }) {
  return (
    <div className="ds-stat">
      <div className={`ds-stat__value${accent ? ' ds-stat__value--accent' : ''}`}>{value}</div>
      <div className="ds-stat__label">{label}</div>
    </div>
  );
}

export default Stat;
