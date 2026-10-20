/**
 * Título otorgado con indicador de color de carrera.
 */

import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';

const CarreraTituloDotCell = ({ tituloOtorgado, colorHex }) => {
  const swatch = sanitizeDocenteColorHex(colorHex);
  return (
    <span className="cfg-carrera-titulo-dot">
      {swatch ? (
        <span className="cfg-carrera-titulo-dot__swatch" style={{ backgroundColor: swatch }} aria-hidden />
      ) : null}
      <span className="cfg-carrera-titulo-dot__texto">{tituloOtorgado || '—'}</span>
    </span>
  );
};

export default CarreraTituloDotCell;
