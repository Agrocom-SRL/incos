/**
 * Contenido de una celda día×hora en el calendario semanal (uno o varios bloques).
 */

import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const fmtHora = (t) => {
  if (t == null || t === '') return '—';
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
};

const hexToRgb = (hex) => {
  const normalized = sanitizeDocenteColorHex(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
    hex: normalized,
  };
};

const DocenteHorarioSemanaCell = ({ items = [] }) => {
  if (!items.length) {
    return <div className="da-cal-semanal__cell-inner da-cal-semanal__cell-inner--empty" aria-hidden />;
  }

  return (
    <div className="da-cal-semanal__cell-inner">
      {items.map((ev, idx) => {
        const rgb = hexToRgb(ev.cursoColorHex);
        const hora =
          ev.horaInicio || ev.horaFin ? `${fmtHora(ev.horaInicio)}–${fmtHora(ev.horaFin)}` : '—';
        const chipStyle = rgb
          ? {
              borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
              backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
              boxShadow: `inset 0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
            }
          : undefined;
        return (
          <div
            key={`${ev.cursoCodigo}-${ev.orden}-${idx}`}
            className="da-cal-semanal__chip"
            style={chipStyle}
          >
            <div className="da-cal-semanal__chip-hora">{hora}</div>
            <div className="da-cal-semanal__chip-curso">{ev.cursoCodigo || '—'}</div>
            {ev.aula ? <div className="da-cal-semanal__chip-line">Aula: {ev.aula}</div> : null}
            {ev.turno ? <div className="da-cal-semanal__chip-line">Turno: {ev.turno}</div> : null}
            {ev.paralelo ? <div className="da-cal-semanal__chip-line">Paralelo: {ev.paralelo}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

export default DocenteHorarioSemanaCell;
