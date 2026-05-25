/**
 * Celda de componente bimestre (teórico / práctico) — lectura muestra 0 si no hay valor.
 */

import { memo, useCallback } from 'react';
import { InputNumber } from 'antd';
import { parseNotaInput } from '@application-academico/calificaciones/utils/parseNotaInput.js';

const ComponenteNotaCell = ({
  valor,
  max = 100,
  soloLectura = true,
  onChange,
  etiqueta = 'Puntos',
}) => {
  const maximo = Math.round(Number(max) || 100);
  const num = valor == null || valor === '' ? null : Number(valor);
  const excede = num != null && Number.isFinite(num) && Math.round(num) > maximo;

  const handleChange = useCallback(
    (raw) => {
      const parsed = parseNotaInput(raw);
      if (parsed === undefined && raw != null && raw !== '') return;
      onChange?.(parsed);
    },
    [onChange],
  );

  const mostrar = soloLectura ? (num ?? 0) : num;

  if (soloLectura) {
    return (
      <span
        className={[
          'cal-nota-cell',
          'cal-nota-cell--filled',
          'cal-nota-cell--readonly',
          excede ? 'cal-nota-cell--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="cal-nota-cell__readonly-valor">{mostrar}</span>
      </span>
    );
  }

  const vacio = mostrar == null || mostrar === '';

  return (
    <span
      className={[
        'cal-nota-cell',
        'cal-nota-cell--filled',
        'cal-nota-cell--editable',
        vacio ? 'cal-nota-cell--editable-empty' : '',
        excede ? 'cal-nota-cell--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <InputNumber
        className="cal-nota-cell__input"
        min={0}
        max={maximo}
        precision={0}
        step={1}
        controls={false}
        value={vacio ? null : mostrar}
        onChange={handleChange}
        status={excede ? 'error' : undefined}
        aria-label={
          excede
            ? `${mostrar} puntos: supera el máximo de ${maximo}`
            : vacio
              ? `${etiqueta} sin cargar`
              : `${mostrar} de ${maximo} puntos`
        }
        aria-invalid={excede || undefined}
      />
    </span>
  );
};

export default memo(ComponenteNotaCell);
