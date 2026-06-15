/**
 * Celda de identificación del estudiante (código + nombre) — cuaderno y consolidado.
 */

const CeldaEstudiante = ({ nombre, codigo }) => (
  <span className="cal-celda-estudiante">
    <span className="cal-celda-estudiante__margen" aria-hidden />
    <span className="cal-celda-estudiante__texto">
      {codigo ? <span className="cal-celda-estudiante__codigo">{codigo}</span> : null}
      <span className="cal-celda-estudiante__nombre">{nombre}</span>
    </span>
  </span>
);

export default CeldaEstudiante;
