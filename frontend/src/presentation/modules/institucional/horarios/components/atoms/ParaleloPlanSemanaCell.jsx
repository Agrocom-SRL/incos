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
                        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`,
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
                        {ev.materiaSigla ? (
                            <div className="da-cal-semanal__chip-sigla">{ev.materiaSigla}</div>
                        ) : null}
                        {(() => {
                            const nom = ev.materiaNombre != null ? String(ev.materiaNombre).trim() : '';
                            const sig = ev.materiaSigla != null ? String(ev.materiaSigla).trim() : '';
                            let label = '';
                            if (nom && sig && nom !== sig) label = nom;
                            else if (nom) label = nom;
                            else if (!sig) label = `Asignación ${ev.cursoCodigo}`;
                            return label ? <div className="da-cal-semanal__chip-curso">{label}</div> : null;
                        })()}
                        {ev.carrera ? <div className="da-cal-semanal__chip-line">{ev.carrera}</div> : null}
                        {ev.paralelo || ev.turno ? (
                            <div className="da-cal-semanal__chip-line text-bold">
                                {[ev.paralelo, ev.turno].filter(Boolean).join(' · ')}
                            </div>
                        ) : null}
                        {ev.docente ? (
                            <div className="da-cal-semanal__chip-line">
                                Docente: {editable ? ev.docente : <strong>{ev.docente}</strong>}
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
