/**
 * Átomo: chip arrastrable del catálogo de materias (builder de periodo).
 * Fuente del Flujo A (agregar asignatura al periodo por drag & drop, ver
 * `PlanPeriodoAsignaturasPage.jsx`). Solo presentación + `useDraggable`; la
 * validación de cupo de horas y el alta viven en la página/hook.
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';

const MateriaCatalogoChip = ({ materia, disabled = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `materia-${materia.id}`,
    data: { type: 'materia', materia },
    disabled,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cfg-plan-builder-chip cfg-plan-builder-chip--catalogo${
        isDragging ? ' cfg-plan-builder-chip--dragging' : ''
      }${disabled ? ' cfg-plan-builder-chip--disabled' : ''}`}
      {...listeners}
      {...attributes}
    >
      {!disabled ? <HolderOutlined className="cfg-plan-builder-chip__handle" /> : null}
      <span className="cfg-plan-builder-chip__sigla">{materia.sigla || '—'}</span>
      <span className="cfg-plan-builder-chip__nombre">{materia.nombre}</span>
    </div>
  );
};

export default MateriaCatalogoChip;
