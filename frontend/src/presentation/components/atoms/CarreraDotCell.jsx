/**
 * Átomo: celda de carrera = swatch de color + nombre (patrón "Título otorgado" de Carreras).
 *
 * Muestra SOLO el punto de color de la carrera + su nombre (sin código). Estilos globales
 * `cfg-carrera-titulo-dot*` (styles/components/atoms/table-cells.css).
 *
 * @param {string} nombre - Nombre de la carrera.
 * @param {string} [colorHex] - Color de la carrera; si falta, usa un gris neutro.
 */

const CarreraDotCell = ({ nombre, colorHex }) => (
  <span className="cfg-carrera-titulo-dot">
    <span
      className="cfg-carrera-titulo-dot__swatch"
      style={{ backgroundColor: colorHex || 'var(--border, #d1d5db)' }}
      aria-hidden
    />
    <span className="cfg-carrera-titulo-dot__texto">{nombre || '—'}</span>
  </span>
);

export default CarreraDotCell;
