/**
 * Celda de nota con auto-guardado simulado (fake API).
 */

import { useCallback, useEffect, useMemo } from 'react';
import { InputNumber, Spin, Tooltip } from 'antd';
import { ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNotaAutosave } from '@application-academico/calificaciones/hooks/useNotaAutosave.js';
import { useCuadernoAutosaveRegistry } from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';
import { parseNotaInput } from '@application-academico/calificaciones/utils/parseNotaInput.js';

const NotaCell = ({
  cursoId,
  estudianteId,
  evaluacionId,
  valorInicial,
  soloLectura = false,
}) => {
  const cellKey = useMemo(
    () => `${estudianteId}::${evaluacionId}`,
    [estudianteId, evaluacionId],
  );
  const { registerCell, unregisterCell } = useCuadernoAutosaveRegistry();

  const { valor, estado, setValor, reintentar } = useNotaAutosave({
    cursoId,
    estudianteId,
    evaluacionId,
    valorInicial,
  });

  useEffect(() => {
    registerCell(cellKey, { estado, reintentar });
    return () => unregisterCell(cellKey);
  }, [cellKey, estado, reintentar, registerCell, unregisterCell]);

  const handleChange = useCallback(
    (raw) => {
      const parsed = parseNotaInput(raw);
      if (parsed === undefined && raw != null && raw !== '') return;
      setValor(parsed);
    },
    [setValor],
  );

  const vacio = valor == null || valor === '';
  const estadoClass = soloLectura ? 'idle' : estado;

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
        `cal-nota-cell--${estadoClass}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <InputNumber
        className="cal-nota-cell__input"
        min={0}
        max={100}
        precision={2}
        step={0.5}
        controls={false}
        value={vacio ? null : valor}
        onChange={handleChange}
        aria-label={vacio ? 'Nota sin cargar' : `Nota ${valor}`}
      />
      {estado === 'guardando' ? (
        <LoadingOutlined className="cal-nota-cell__spinner" spin aria-hidden />
      ) : null}
      {estado === 'error' ? (
        <Tooltip title="Error al guardar. Click para reintentar.">
          <button
            type="button"
            className="cal-nota-cell__error-btn"
            onClick={reintentar}
            aria-label="Reintentar guardado"
          >
            <ExclamationCircleOutlined />
          </button>
        </Tooltip>
      ) : null}
    </span>
  );
};

export default NotaCell;
