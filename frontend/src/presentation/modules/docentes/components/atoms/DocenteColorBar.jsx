/**
 * Barra de acento con color de curso/carrera (hex de seeders). Átomo reutilizable en ficha docente.
 */

import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';

/**
 * @param {{ hex?: string|null, className?: string, title?: string }} props
 */
const DocenteColorBar = ({ hex, className = '', title }) => {
  const c = sanitizeDocenteColorHex(hex);
  if (!c) return null;
  return (
    <span
      className={`docente-color-bar ${className}`.trim()}
      style={{ background: c }}
      title={title}
      aria-hidden
    />
  );
};

export default DocenteColorBar;
