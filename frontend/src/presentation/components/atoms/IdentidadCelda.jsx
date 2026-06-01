/**
 * Átomo: celda con sigla/código arriba y nombre abajo (listados académicos).
 */

const IdentidadCelda = ({ codigo, nombre, className = 'cfg-materia-identidad', accentColor }) => {
  const accentStyle = accentColor ? { color: accentColor } : undefined;
  const margenStyle = accentColor ? { backgroundColor: accentColor } : undefined;

  return (
    <span className={className}>
      <span className={`${className}__margen`} style={margenStyle} aria-hidden />
      <span className={`${className}__texto`}>
        {codigo ? (
          <span className={`${className}__sigla`} style={accentStyle}>
            {codigo}
          </span>
        ) : null}
        <span className={`${className}__nombre`} style={accentStyle}>
          {nombre || '—'}
        </span>
      </span>
    </span>
  );
};

export default IdentidadCelda;
