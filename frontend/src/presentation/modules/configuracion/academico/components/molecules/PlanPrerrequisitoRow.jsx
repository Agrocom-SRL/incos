/**
 * Molécula: fila de la columna «Prerrequisitos» del builder — celda-etiqueta
 * con la sigla de la asignatura (mismo lenguaje que las celdas GESTIÓN/CARRERA
 * de la ficha del cuaderno: fondo primario, texto claro) + slot droppable.
 */

import PlanBuilderPrerrequisitoSlot from './PlanBuilderPrerrequisitoSlot';

const PlanPrerrequisitoRow = ({ fila, disabled, onEliminar }) => (
  <div className="cfg-plan-builder__prereq-row">
    <span className="cfg-plan-builder__prereq-sigla" title={fila.nombre}>
      {fila.sigla || '—'}
    </span>
    <PlanBuilderPrerrequisitoSlot
      filaKey={fila.key}
      prerrequisitos={fila.prereqs}
      disabled={disabled}
      onEliminar={onEliminar}
    />
  </div>
);

export default PlanPrerrequisitoRow;
