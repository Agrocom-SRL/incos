/**
 * Átomo: etapa/periodo del cronograma como pill teñido con su color propio
 * (color de negocio en BD `periodos_academicos.color_hex`, sanitizado).
 */

import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const CronogramaEtapaCell = ({ nombre, colorHex }) => {
  const color = sanitizeDocenteColorHex(colorHex);

  if (!color) {
    return (
      <span className="cronograma-etapa">
        <span className="cronograma-etapa__pill cronograma-pill--otro">{nombre || '—'}</span>
      </span>
    );
  }

  return (
    <span className="cronograma-etapa">
      <span
        className="cronograma-etapa__pill"
        style={{
          color,
          backgroundColor: `color-mix(in srgb, ${color} 14%, #fff)`,
          borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        }}
      >
        <span className="cronograma-etapa__swatch" style={{ backgroundColor: color }} aria-hidden />
        {nombre || '—'}
      </span>
    </span>
  );
};

export default CronogramaEtapaCell;
