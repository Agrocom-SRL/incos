/**
 * HistorialNotaInput — celda de nota del historial (gemela de `NotaCell` del
 * cuaderno de calificaciones): entrada numérica ENTERA, centrada, ancho fijo,
 * sin controles de spinner y con el mismo lenguaje visual (borde suave, fondo
 * tenue, borde punteado mientras está vacía, rojo al exceder el máximo).
 *
 * Aquí no hay autosave: el valor viaja en el payload de la inscripción, así que
 * el estado lo gobierna el hook del wizard.
 *
 * Estilos: theme/historial-notas.css (.historial-nota-cell*).
 */

import { InputNumber } from 'antd';

const NOTA_MAXIMA = 100;

const HistorialNotaInput = ({ value = null, invalido = false, disabled = false, onChange, materia = null }) => {
  const vacio = value == null || value === '';
  const excede = !vacio && Number(value) > NOTA_MAXIMA;
  const error = invalido || excede;

  return (
    <span
      className={[
        'historial-nota-cell',
        vacio ? 'historial-nota-cell--vacia' : '',
        error ? 'historial-nota-cell--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <InputNumber
        className="historial-nota-cell__input"
        min={0}
        max={NOTA_MAXIMA}
        precision={0}
        step={1}
        controls={false}
        disabled={disabled}
        value={vacio ? null : value}
        onChange={(raw) => {
          if (raw == null || raw === '') {
            onChange?.(null);
            return;
          }
          const entero = Math.round(Number(raw));
          if (!Number.isFinite(entero)) return;
          onChange?.(entero);
        }}
        status={error ? 'error' : undefined}
        aria-label={
          materia
            ? `Nota final de ${materia} (0 a ${NOTA_MAXIMA})`
            : `Nota final (0 a ${NOTA_MAXIMA})`
        }
        aria-invalid={error || undefined}
      />
    </span>
  );
};

export default HistorialNotaInput;
