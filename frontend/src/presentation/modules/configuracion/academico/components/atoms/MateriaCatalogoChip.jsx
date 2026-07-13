/**
 * Átomo: tile arrastrable del catálogo de materias (builder de periodo) —
 * tarjeta compacta estilo curriculum builder: sigla en la primera fila,
 * nombre debajo (2 líneas máx.) y pill de tipo pedagógico (mismo átomo global
 * `cfg-materia-pill` del listado de materias). Si la materia pertenece a un
 * año ANTERIOR, un badge lo indica: solo sirve como prerrequisito (Flujo B).
 * Solo presentación + `useDraggable`; validaciones y borrador en
 * `usePlanBuilder` / `PlanPeriodoAsignaturasPage.jsx`.
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  getMateriaTipoLabel,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';

const TIPO_MODIFIER = {
  TEORICA: 'teorica',
  PRACTICA: 'practica',
  TEORICA_PRACTICA: 'mixta',
};

const MateriaCatalogoChip = ({ materia, disabled = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `materia-${materia.id}`,
    data: { type: 'materia', materia },
    disabled,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  const tipoModifier = TIPO_MODIFIER[materia.tipo] ?? 'default';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cfg-plan-builder-chip cfg-plan-builder-chip--catalogo cfg-plan-builder-chip--tipo-${tipoModifier}${
        isDragging ? ' cfg-plan-builder-chip--dragging' : ''
      }${disabled ? ' cfg-plan-builder-chip--disabled' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="cfg-plan-builder-chip__top">
        <span className="cfg-plan-builder-chip__sigla">{materia.sigla || '—'}</span>
        {materia.asignadaEn ? (
          <span className="cfg-plan-builder-chip__badge">{materia.asignadaEn.periodoNombre}</span>
        ) : null}
      </div>
      <span className="cfg-plan-builder-chip__nombre">{materia.nombre}</span>
      {materia.tipo ? (
        <span className={`${getMateriaTipoPillClass(materia.tipo)} cfg-plan-builder-chip__tipo`}>
          {getMateriaTipoLabel(materia.tipo)}
        </span>
      ) : null}
    </div>
  );
};

export default MateriaCatalogoChip;
