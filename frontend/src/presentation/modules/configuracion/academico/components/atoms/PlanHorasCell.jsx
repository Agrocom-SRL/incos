/**
 * Átomo: celda de horas semanales de una fila del builder de periodo —
 * gemela visual de la celda de nota del cuaderno de calificaciones
 * (`NotaCell`): cuadro compacto centrado, sin controles ni addon. El cambio
 * solo muta el borrador; se persiste con «Guardar cambios».
 */

import { InputNumber } from 'antd';

const PlanHorasCell = ({ value, max, disabled = false, onChange, ariaLabel }) => (
  <span className={`cfg-plan-horas-cell${disabled ? ' cfg-plan-horas-cell--disabled' : ''}`}>
    <InputNumber
      className="cfg-plan-horas-cell__input"
      min={1}
      max={max}
      precision={0}
      step={1}
      controls={false}
      value={value}
      onChange={(v) => {
        if (v != null) onChange?.(v);
      }}
      disabled={disabled}
      aria-label={ariaLabel ?? 'Horas semanales'}
    />
    <span className="cfg-plan-horas-cell__suffix">h</span>
  </span>
);

export default PlanHorasCell;
