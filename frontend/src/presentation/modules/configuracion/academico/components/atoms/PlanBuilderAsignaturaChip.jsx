/**
 * Átomo: chip arrastrable de UNA asignatura de un periodo ANTERIOR al que se
 * edita. Fuente del Flujo B (prerrequisito cross-periodo, ver
 * `PlanPeriodoAsignaturasPage.jsx` / `PeriodosAnterioresPanel`) — se arrastra
 * hacia `PlanBuilderPrerrequisitoSlot` de una fila del periodo en edición.
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';

const PlanBuilderAsignaturaChip = ({ asignatura, disabled = false, size = 'default' }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `asignatura-${asignatura.id}`,
    data: { type: 'asignatura', asignatura },
    disabled,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cfg-plan-builder-chip cfg-plan-builder-chip--asignatura cfg-plan-builder-chip--${size}${
        isDragging ? ' cfg-plan-builder-chip--dragging' : ''
      }${disabled ? ' cfg-plan-builder-chip--disabled' : ''}`}
      {...listeners}
      {...attributes}
    >
      {!disabled ? <HolderOutlined className="cfg-plan-builder-chip__handle" /> : null}
      <span className="cfg-plan-builder-chip__sigla">{asignatura.sigla || '—'}</span>
      <span className="cfg-plan-builder-chip__nombre">{asignatura.nombre || '—'}</span>
    </div>
  );
};

export default PlanBuilderAsignaturaChip;
