/**
 * Átomo: celda con sigla/código arriba y nombre abajo (listados académicos).
 */

const IdentidadCelda = ({ codigo, nombre, className = 'cfg-materia-identidad' }) => (
  <span className={className}>
    <span className={`${className}__margen`} aria-hidden />
    <span className={`${className}__texto`}>
      {codigo ? <span className={`${className}__sigla`}>{codigo}</span> : null}
      <span className={`${className}__nombre`}>{nombre || '—'}</span>
    </span>
  </span>
);

export default IdentidadCelda;
