/**
 * Celda de nota — cambios en memoria hasta Guardar notas del bimestre.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { InputNumber } from 'antd';
import { useNotaAutosave } from '@application-academico/calificaciones/hooks/useNotaAutosave.js';
import { useCuadernoAutosaveRegistry } from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';
import { parseNotaInput } from '@application-academico/calificaciones/utils/parseNotaInput.js';

const NotaCell = ({
  estudianteId,
  evaluacionId,
  puntosMaximos = 100,
  valorInicial,
  soloLectura = false,
}) => {
  const max = Math.round(Number(puntosMaximos) || 100);

  const cellKey = useMemo(
    () => `${estudianteId}::${evaluacionId}`,
    [estudianteId, evaluacionId],
  );
  const { registerCell, unregisterCell } = useCuadernoAutosaveRegistry();

  const { valor, estado, setValor, necesitaGuardar, obtenerPayload, marcarGuardado } =
    useNotaAutosave({
      estudianteId,
      evaluacionId,
      valorInicial,
    });

  useEffect(() => {
    registerCell(cellKey, {
      estado,
      necesitaGuardar,
      obtenerPayload,
      marcarGuardado,
      evaluacionId,
      estudianteId,
    });
    return () => unregisterCell(cellKey);
  }, [
    cellKey,
    estado,
    necesitaGuardar,
    obtenerPayload,
    marcarGuardado,
    evaluacionId,
    estudianteId,
    registerCell,
    unregisterCell,
  ]);

  const handleChange = useCallback(
    (raw) => {
      const parsed = parseNotaInput(raw);
      if (parsed === undefined && raw != null && raw !== '') return;
      setValor(parsed);
    },
    [setValor],
  );

  const vacio = valor == null || valor === '';
  const pendiente = estado === 'pendiente';
  const excedeMaximo =
    !vacio && Number.isFinite(Number(valor)) && Math.round(Number(valor)) > max;

  if (soloLectura && vacio) {
    return (
      <span className="cal-nota-cell cal-nota-cell--empty" aria-label="Sin nota">
        —
      </span>
    );
  }

  if (soloLectura) {
    return (
      <span
        className={[
          'cal-nota-cell',
          'cal-nota-cell--filled',
          'cal-nota-cell--readonly',
          excedeMaximo ? 'cal-nota-cell--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="cal-nota-cell__readonly-valor">{valor}</span>
      </span>
    );
  }

  return (
    <span
      className={[
        'cal-nota-cell',
        'cal-nota-cell--filled',
        'cal-nota-cell--editable',
        vacio ? 'cal-nota-cell--editable-empty' : '',
        pendiente ? 'cal-nota-cell--pendiente' : '',
        excedeMaximo ? 'cal-nota-cell--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <InputNumber
        className="cal-nota-cell__input"
        min={0}
        precision={0}
        step={1}
        controls={false}
        value={vacio ? null : valor}
        onChange={handleChange}
        status={excedeMaximo ? 'error' : undefined}
        aria-label={
          excedeMaximo
            ? `${valor} puntos: supera el máximo de ${max} para esta actividad`
            : vacio
              ? 'Puntos sin cargar'
              : `${valor} de ${max} puntos`
        }
        aria-invalid={excedeMaximo || undefined}
      />
    </span>
  );
};

export default NotaCell;
