/**
 * Celda de rol con indicador de color por categoría (patrón `cfg-carrera-titulo-dot`).
 * Estilos importados por la página de listado.
 */
import { rolColorVar } from './rolColor.js';

const RolDotCell = ({ nombre, tipo, isSystem = false, sub }) => (
  <span className="cfg-carrera-titulo-dot">
    <span
      className="cfg-carrera-titulo-dot__swatch"
      style={{ backgroundColor: rolColorVar(tipo, isSystem) }}
      aria-hidden
    />
    <span className="cfg-carrera-titulo-dot__texto">
      {nombre || 'Sin rol'}
      {sub ? <span style={{ color: 'var(--color-text-tertiary)' }}> · {sub}</span> : null}
    </span>
  </span>
);

export default RolDotCell;
