/**
 * Contenido de una celda día×hora en el calendario semanal (uno o varios bloques).
 */

import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';

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

const DocenteHorarioSemanaCell = ({
  items = [],
  // Props opcionales usados por ParaleloPlanSemanaCell / grilla extendida (no se reenvían al DOM)
  slotDia: _slotDia,
  slotMinutes: _slotMinutes,
  editable: _editable = false,
  onBeginDragChip: _onBeginDragChip,
  onDeleteChip: _onDeleteChip,
}) => {
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
            borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
            backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`,
            boxShadow: `inset 0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
          }
          : undefined;
        const nombreMateria =
          ev.materiaNombre && ev.materiaSigla && String(ev.materiaNombre).trim() !== String(ev.materiaSigla).trim()
            ? ev.materiaNombre
            : ev.materiaNombre || null;

        return (
          <div
            key={`${ev.cursoCodigo}-${ev.orden}-${idx}`}
            className="da-cal-semanal__chip"
            style={chipStyle}
          >
            <div className="da-cal-semanal__chip-hora">{hora}</div>
            {ev.materiaSigla ? (
              <div className="da-cal-semanal__chip-sigla">{ev.materiaSigla}</div>
            ) : null}
            {nombreMateria ? (
              <div className="da-cal-semanal__chip-curso">{nombreMateria}</div>
            ) : ev.materiaSigla ? null : (
              <div className="da-cal-semanal__chip-curso">Materia sin detalle</div>
            )}
            {ev.carrera ? <div className="da-cal-semanal__chip-line">{ev.carrera}</div> : null}
            {ev.paralelo || ev.turno ? (
              <div className="da-cal-semanal__chip-line text-bold">
                {[ev.paralelo, ev.turno].filter(Boolean).join(' · ')}
              </div>
            ) : null}
            {ev.docente ? (
              <div className="da-cal-semanal__chip-line">
                Docente: <strong>{ev.docente}</strong>
              </div>
            ) : null}
            {ev.aula ? <div className="da-cal-semanal__chip-line">{ev.aula}</div> : null}
          </div>
        );
      })}
    </div>
  );
};

export default DocenteHorarioSemanaCell;
