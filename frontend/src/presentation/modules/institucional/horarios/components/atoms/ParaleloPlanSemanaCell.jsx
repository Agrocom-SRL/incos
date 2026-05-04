/**
 * Celda día×hora en el plan semanal del paralelo (chips arrastrables en modo edición).
 */

import { CloseOutlined } from '@ant-design/icons';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

export const DRAG_MIME = 'application/x-incos-paralelo-bloque';

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

const ParaleloPlanSemanaCell = ({
    items = [],
    slotDia,
    slotMinutes,
    editable = false,
    onBeginDragChip,
    onDeleteChip,
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
                        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`,
                        boxShadow: `inset 0 0 0 1px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
                    }
                    : undefined;

                const handleDragStart = (e) => {
                    if (!editable || !onBeginDragChip) return;
                    onBeginDragChip(e, ev, slotDia, slotMinutes);
                };

                return (
                    <div
                        key={`${ev.cursoCodigo}-${ev.cursoHorarioId ?? ev.orden}-${idx}`}
                        className={`da-cal-semanal__chip ${editable ? 'da-cal-semanal__chip--draggable' : ''}`}
                        style={chipStyle}
                        draggable={Boolean(editable && onBeginDragChip)}
                        onDragStart={handleDragStart}
                    >
                        {editable && onDeleteChip ? (
                            <button
                                type="button"
                                className="horarios-plan-chip__remove"
                                aria-label="Quitar bloque del plan"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChip(ev);
                                }}
                            >
                                <CloseOutlined />
                            </button>
                        ) : null}
                        <div className="da-cal-semanal__chip-hora">{hora}</div>
                        <div className="da-cal-semanal__chip-curso">
                            {ev.materiaNombre || ev.materiaSigla || `Asignación ${ev.cursoCodigo}`}
                        </div>
                        {ev.materiaNombre && ev.materiaSigla ? (
                            <div className="da-cal-semanal__chip-line" style={{ fontSize: 11, opacity: 0.85 }}>
                                {ev.materiaSigla}
                            </div>
                        ) : null}
                        {ev.carrera ? <div className="da-cal-semanal__chip-line">{ev.carrera}</div> : null}
                        {ev.paralelo ? (
                            <div className="da-cal-semanal__chip-line text-bold">
                                {ev.paralelo}
                                {ev.turno ? ` · ${ev.turno}` : ''}
                            </div>
                        ) : null}
                        {!editable && ev.aula ? (
                            <div className="da-cal-semanal__chip-line">Aula: {ev.aula}</div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};

export default ParaleloPlanSemanaCell;
