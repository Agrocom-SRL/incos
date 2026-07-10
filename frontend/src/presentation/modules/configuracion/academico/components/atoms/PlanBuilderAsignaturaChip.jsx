/**
 * Átomo: chip arrastrable de UNA asignatura ya colocada en un periodo.
 * Doble uso en `PlanPeriodoAsignaturasPage.jsx`:
 *   - Fuente del Flujo B (prerrequisito cross-periodo): cualquier asignatura
 *     de CUALQUIER periodo es arrastrable hacia `PlanBuilderPrerrequisitoSlot`.
 *   - Identidad de fila del periodo en edición (sin `draggable` deshabilitado;
 *     la validación de periodo-anterior vive en `usePlanBuilder.puedeSerPrerrequisito`).
 * `locked` atenúa visualmente las asignaturas de periodos NO anteriores al
 * que se edita (posteriores o el mismo), para anticipar que el drop será
 * rechazado — sigue siendo arrastrable para que el rechazo en `onDragOver`
 * sea el feedback definitivo (ver contrato del Flujo B).
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined, LockOutlined } from '@ant-design/icons';

const PlanBuilderAsignaturaChip = ({ asignatura, locked = false, disabled = false, size = 'default' }) => {
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
      }${locked ? ' cfg-plan-builder-chip--locked' : ''}${disabled ? ' cfg-plan-builder-chip--disabled' : ''}`}
      title={locked ? 'Solo se admite como prerrequisito de un periodo posterior' : undefined}
      {...listeners}
      {...attributes}
    >
      {!disabled ? <HolderOutlined className="cfg-plan-builder-chip__handle" /> : null}
      <span className="cfg-plan-builder-chip__sigla">{asignatura.sigla || '—'}</span>
      <span className="cfg-plan-builder-chip__nombre">{asignatura.nombre || '—'}</span>
      {locked ? <LockOutlined className="cfg-plan-builder-chip__lock" /> : null}
    </div>
  );
};

export default PlanBuilderAsignaturaChip;
