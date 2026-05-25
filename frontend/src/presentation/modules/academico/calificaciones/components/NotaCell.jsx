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
      const parsed = parseNotaInput(raw, max);
      if (parsed === undefined && raw != null && raw !== '') return;
      setValor(parsed);
    },
    [setValor, max],
  );

  const vacio = valor == null || valor === '';
  const pendiente = estado === 'pendiente';

  if (soloLectura && vacio) {
    return (
      <span className="cal-nota-cell cal-nota-cell--empty" aria-label="Sin nota">
        —
      </span>
    );
  }

  if (soloLectura) {
    return (
      <span className="cal-nota-cell cal-nota-cell--filled cal-nota-cell--readonly">
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
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <InputNumber
        className="cal-nota-cell__input"
        min={0}
        max={max}
        precision={0}
        step={1}
        controls={false}
        value={vacio ? null : valor}
        onChange={handleChange}
        aria-label={vacio ? 'Puntos sin cargar' : `${valor} de ${max} puntos`}
      />
    </span>
  );
};

export default NotaCell;
