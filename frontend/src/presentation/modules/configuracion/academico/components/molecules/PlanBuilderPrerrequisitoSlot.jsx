/**
 * Molécula: slot droppable de prerrequisitos de UNA fila del periodo en
 * edición (cuadro «Prerrequisitos» del builder). Recibe el drop de una
 * materia de años anteriores O de un tag ya colocado en otra fila (mover un
 * prerrequisito equivocado a su fila correcta sin eliminarlo). Los tags del
 * borrador son a la vez arrastrables (`type: 'prereq-tag'`) y cerrables. Sin
 * botones: el drag & drop es la única vía; todo se confirma con «Guardar
 * cambios» en la página.
 */

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Tag, Tooltip } from 'antd';

const PrereqTagDraggable = ({ filaKey, prereq, disabled, onEliminar }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `prereq-tag-${filaKey}-${prereq.key}`,
    data: { type: 'prereq-tag', fromFilaKey: filaKey, prereq },
    disabled,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={`cfg-plan-builder-prereq-tag-wrap${
        isDragging ? ' cfg-plan-builder-prereq-tag-wrap--dragging' : ''
      }${disabled ? '' : ' cfg-plan-builder-prereq-tag-wrap--draggable'}`}
      {...listeners}
      {...attributes}
    >
      <Tooltip title={`${prereq.nombre ?? ''}${prereq.periodoNombre ? ` · ${prereq.periodoNombre}` : ''}`}>
        <Tag
          className="cfg-plan-builder-prereq-tag"
          closable={!disabled}
          onClose={(e) => {
            e.preventDefault();
            onEliminar?.(prereq.key);
          }}
        >
          {prereq.sigla || prereq.nombre || `#${prereq.prerrequisitoId}`}
        </Tag>
      </Tooltip>
    </span>
  );
};

const PlanBuilderPrerrequisitoSlot = ({ filaKey, prerrequisitos = [], disabled = false, onEliminar }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `prereq-slot-${filaKey}`,
    data: { type: 'prereq-slot', filaKey },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`cfg-plan-builder-prereq-slot${isOver ? ' cfg-plan-builder-prereq-slot--over' : ''}`}
    >
      {prerrequisitos.length === 0 ? (
        <span className="cfg-plan-builder-prereq-slot__empty">Arrastra aquí</span>
      ) : (
        prerrequisitos.map((p) => (
          <PrereqTagDraggable
            key={p.key}
            filaKey={filaKey}
            prereq={p}
            disabled={disabled}
            onEliminar={onEliminar}
          />
        ))
      )}
    </div>
  );
};

export default PlanBuilderPrerrequisitoSlot;
