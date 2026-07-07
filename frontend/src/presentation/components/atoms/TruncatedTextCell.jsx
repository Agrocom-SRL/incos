/**
 * Átomo: párrafo truncado a 2 líneas con tooltip nativo (`title`), patrón "Área y
 * descripción" de Carreras. Estilos globales `cfg-carrera-area-desc__texto*`
 * (table-cells.css). Usado para columnas "Descripción" de catálogos simples.
 *
 * @param {string} [text] - Texto a truncar.
 * @param {string} [emptyLabel='—'] - Texto mostrado cuando no hay valor.
 */

const TruncatedTextCell = ({ text, emptyLabel = '—' }) =>
  text ? (
    <p className="cfg-carrera-area-desc__texto" title={text}>
      {text}
    </p>
  ) : (
    <p className="cfg-carrera-area-desc__texto cfg-carrera-area-desc__texto--empty">
      {emptyLabel}
    </p>
  );

export default TruncatedTextCell;
