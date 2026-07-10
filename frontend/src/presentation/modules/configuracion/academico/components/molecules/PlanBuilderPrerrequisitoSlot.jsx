/**
 * Molécula: celda «PRE-REQUISITO» de una fila del periodo en edición (builder).
 * Droppable del Flujo B (drag & drop cross-periodo, ver
 * `PlanPeriodoAsignaturasPage.jsx`): al arrastrar una `PlanBuilderAsignaturaChip`
 * encima, `invalid` (calculado por el padre con `puedeSerPrerrequisito`)
 * pinta el slot en rojo — bloquea el `onDragEnd`, no solo lo advierte tarde.
 * Los prerrequisitos ya asignados se muestran como `Tag` cerrable; el botón
 * «+» es el fallback accesible sin drag (abre `PrerrequisitoFormModal`).
 */

import { useDroppable } from '@dnd-kit/core';
import { Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { PLAN_PRERREQUISITOS_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';

const PlanBuilderPrerrequisitoSlot = ({
  asignaturaId,
  prerrequisitos = [],
  invalid = false,
  disabled = false,
  onEliminar,
  onAgregarClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `prereq-slot-${asignaturaId}`,
    data: { type: 'prereq-slot', asignaturaId },
    disabled,
  });

  const showInvalid = isOver && invalid;

  return (
    <div
      ref={setNodeRef}
      className={`cfg-plan-builder-prereq-slot${isOver ? ' cfg-plan-builder-prereq-slot--over' : ''}${
        showInvalid ? ' cfg-plan-builder-prereq-slot--invalid' : ''
      }`}
    >
      {prerrequisitos.length === 0 ? (
        <span className="cfg-plan-builder-prereq-slot__empty">Arrastra un prerrequisito</span>
      ) : (
        prerrequisitos.map((p) => (
          <Tag
            key={p.id}
            color="processing"
            closable={!disabled}
            onClose={(e) => {
              e.preventDefault();
              onEliminar?.(p.id);
            }}
          >
            {p.label}
          </Tag>
        ))
      )}
      {!disabled ? (
        <ActionButton
          permiso={PLAN_PRERREQUISITOS_PERMISO}
          accion="CREAR"
          variant="info"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAgregarClick}
          aria-label="Agregar prerrequisito"
        />
      ) : null}
    </div>
  );
};

export default PlanBuilderPrerrequisitoSlot;
