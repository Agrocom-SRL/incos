/**
 * Celda de marca de asistencia (átomo, gemelo de NotaCell).
 *
 * Muestra la marca derivada P/R/F/L. Editable solo si la columna es día de clase,
 * no neutro, no futuro y el registro no está cerrado. El click cicla el estado vía
 * `onToggle` (lógica de ciclo en el state hook). Días neutros/futuros: solo lectura.
 */
import { memo } from 'react';
import { marcaDeEstado, MARCA } from '@application-academico/asistencia/utils/asistenciaMarcas.js';

/** Etiqueta accesible por marca. */
const ARIA_MARCA = {
  [MARCA.PRESENTE]: 'Presente',
  [MARCA.TARDANZA]: 'Atraso',
  [MARCA.AUSENTE]: 'Ausente',
  [MARCA.LICENCIA]: 'Licencia',
};

const CeldaAsistencia = ({ estado, neutro, editable, futuro, onToggle, estudianteNombre, fecha }) => {
  const marca = marcaDeEstado(estado, neutro);
  const esFalta = marca === MARCA.AUSENTE;
  const esAtraso = marca === MARCA.TARDANZA;
  const esLicencia = marca === MARCA.LICENCIA;

  // Días futuros: columna gris, no clickeable.
  if (futuro) {
    return (
      <span className="asi-celda asi-celda--futuro" aria-label="Día futuro, sin tomar">
        <span className="asi-celda__marca">·</span>
      </span>
    );
  }

  // Neutro (feriado / clase no dictada / licencia): solo lectura.
  if (neutro) {
    return (
      <span
        className={`asi-celda asi-celda--neutro${esLicencia ? ' asi-celda--licencia' : ''}`}
        aria-label={esLicencia ? `Licencia de ${estudianteNombre}` : 'Día sin clase'}
      >
        <span className="asi-celda__marca">{esLicencia ? MARCA.LICENCIA : '—'}</span>
      </span>
    );
  }

  const className = [
    'asi-celda',
    editable ? 'asi-celda--editable' : 'asi-celda--readonly',
    esFalta ? 'asi-celda--falta' : '',
    esAtraso ? 'asi-celda--atraso' : '',
    !esFalta && !esAtraso ? 'asi-celda--presente' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = `${ARIA_MARCA[marca]} · ${estudianteNombre} · ${fecha}`;

  if (!editable) {
    return (
      <span className={className} aria-label={label}>
        <span className="asi-celda__marca">{marca}</span>
      </span>
    );
  }

  return (
    <button type="button" className={className} onClick={onToggle} aria-label={`${label}. Tocá para cambiar`}>
      <span className="asi-celda__marca">{marca}</span>
    </button>
  );
};

export default memo(CeldaAsistencia);
