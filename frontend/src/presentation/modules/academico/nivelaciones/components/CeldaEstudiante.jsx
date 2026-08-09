/**
 * Celda de identificación del estudiante (código + nombre) — grilla de
 * Nivelación. Duplicado local de
 * `centralizador/components/CeldaEstudiante.jsx` (módulo autocontenido).
 */

const CeldaEstudiante = ({ nombre, codigo }) => (
  <span className="niv-nivelacion-estudiante">
    <span className="niv-nivelacion-estudiante__margen" aria-hidden />
    <span className="niv-nivelacion-estudiante__texto">
      {codigo ? <span className="niv-nivelacion-estudiante__codigo">{codigo}</span> : null}
      <span className="niv-nivelacion-estudiante__nombre">{nombre}</span>
    </span>
  </span>
);

export default CeldaEstudiante;
