/**
 * ResumenDato — columna de la franja de datos de una ficha de resumen
 * (`.insc-resumen__datos`): rótulo en versalitas sobre el valor.
 *
 * Molécula compartida por los resúmenes de cierre de los wizards de inscripción
 * (Matrícula: `InscripcionSeleccionResumen`; Capacitación:
 * `InscripcionCapSeleccionResumen`). Sin valor no renderiza nada, así la franja
 * omite los datos que aún no existen. Estilos: materias-planilla.css (.insc-resumen*).
 */

const ResumenDato = ({ label, value }) =>
  value ? (
    <div className="insc-resumen__dato">
      <span className="insc-resumen__dato-label">{label}</span>
      <span className="insc-resumen__dato-valor">{value}</span>
    </div>
  ) : null;

export default ResumenDato;
