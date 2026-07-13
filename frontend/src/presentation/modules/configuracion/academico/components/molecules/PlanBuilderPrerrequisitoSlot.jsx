/**
 * Molécula: slot droppable de prerrequisitos de UNA fila del periodo en
 * edición (columna «Prerrequisitos» del builder). Recibe el drop de una
 * materia del catálogo ya asignada a un año anterior; los prerrequisitos del
 * borrador se muestran como tags cerrables (sigla, nombre en tooltip). Sin
 * botones: el drag & drop es la única vía de alta (todo se confirma con
 * «Guardar cambios» en la página).
 */

import { useDroppable } from '@dnd-kit/core';
import { Tag, Tooltip } from 'antd';

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
        <span className="cfg-plan-builder-prereq-slot__empty">Sin prerrequisito — arrastra aquí</span>
      ) : (
        prerrequisitos.map((p) => (
          <Tooltip key={p.key} title={`${p.nombre ?? ''}${p.periodoNombre ? ` · ${p.periodoNombre}` : ''}`}>
            <Tag
              className="cfg-plan-builder-prereq-tag"
              closable={!disabled}
              onClose={(e) => {
                e.preventDefault();
                onEliminar?.(p.key);
              }}
            >
              {p.sigla || p.nombre || `#${p.prerrequisitoId}`}
            </Tag>
          </Tooltip>
        ))
      )}
    </div>
  );
};

export default PlanBuilderPrerrequisitoSlot;
