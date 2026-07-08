/**
 * Átomo: celda con ícono + título + descripción truncada a 2 líneas (patrón "Área y
 * descripción" de Carreras). Reutilizable para nombre+descripción de entidades
 * (p. ej. tipo de beca). Estilos globales `cfg-carrera-area-desc*` (table-cells.css).
 *
 * @param {React.ReactNode} [icon] - Ícono junto al título.
 * @param {string} titulo - Texto principal (nombre).
 * @param {string} [descripcion] - Texto secundario truncado a 2 líneas.
 */

import TruncatedTextCell from './TruncatedTextCell';

const IconTituloDescCell = ({ icon, titulo, descripcion }) => (
  <div className="cfg-carrera-area-desc">
    <div className="cfg-carrera-area-desc__area">
      {icon ? (
        <span className="cfg-carrera-area-desc__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span>{titulo || '—'}</span>
    </div>
    <TruncatedTextCell text={descripcion} />
  </div>
);

export default IconTituloDescCell;
