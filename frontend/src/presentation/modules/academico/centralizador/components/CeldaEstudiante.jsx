/**
 * Celda de identificación del estudiante (código + nombre) — grillas del
 * centralizador. Equivalente local de la celda del cuaderno: el módulo es
 * autocontenido y no depende de los componentes de calificaciones.
 */

const CeldaEstudiante = ({ nombre, codigo }) => (
  <span className="cal-centralizador-estudiante">
    <span className="cal-centralizador-estudiante__margen" aria-hidden />
    <span className="cal-centralizador-estudiante__texto">
      {codigo ? <span className="cal-centralizador-estudiante__codigo">{codigo}</span> : null}
      <span className="cal-centralizador-estudiante__nombre">{nombre}</span>
    </span>
  </span>
);

export default CeldaEstudiante;
