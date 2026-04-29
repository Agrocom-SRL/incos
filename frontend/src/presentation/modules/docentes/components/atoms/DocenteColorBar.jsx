/**
 * Barra de acento con color de curso/carrera (hex de seeders). Átomo reutilizable en ficha docente.
 */

export function sanitizeDocenteColorHex(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
  return null;
}

/** Estilos inline para título de carrera: fondo tenue + texto en color de carrera (seeders). */
export function docenteCarreraTitleStyles(hex) {
  const c = sanitizeDocenteColorHex(hex);
  if (!c) return null;
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return {
    backgroundColor: `rgba(${r},${g},${b},0.16)`,
    color: c,
    borderBottom: 'none',
    boxShadow: `inset 0 0 0 1px rgba(${r},${g},${b},0.22)`,
  };
}

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
