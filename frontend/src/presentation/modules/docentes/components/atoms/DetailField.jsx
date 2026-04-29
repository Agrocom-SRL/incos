/**
 * Campo etiqueta/valor reutilizable (detalle docente y otros módulos con clase sd-field).
 */

const DetailField = ({ label, children, span = 1 }) => (
  <div className={`sd-field sd-field--span-${span}`}>
    <span className="sd-field__label">{label}</span>
    <span className="sd-field__value">{children ?? '—'}</span>
  </div>
);

export default DetailField;
