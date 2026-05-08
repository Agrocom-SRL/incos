import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

export const AULA_ASIGN_MIME = 'application/x-aula-asignacion';

const rgbOf = (hex) => {
  const val = sanitizeDocenteColorHex(hex);
  if (!val) return null;
  return {
    r: parseInt(val.slice(1, 3), 16),
    g: parseInt(val.slice(3, 5), 16),
    b: parseInt(val.slice(5, 7), 16),
  };
};

const AulasAsignacionGrid = ({
  aulas = [],
  rows = [],
  bloques = [],
  puedeEditar = false,
  onDropAsignacion,
  activeDragHorarioId = null,
  onSetActiveDragHorarioId,
  onClearActiveDragHorarioId,
}) => {
  const dragHorarioId = activeDragHorarioId;

  const getBloques = (aulaId, horarioId) =>
    (bloques || [])
      .filter(
      (b) =>
        Number(b.aula_id) === Number(aulaId) &&
        Number(b.horario_id) === Number(horarioId) &&
        Number(b.curso_horario_id) > 0
      )
      .sort(
        (a, b) =>
          Number(a.orden_secuencia || 0) - Number(b.orden_secuencia || 0) ||
          String(a.materia_sigla || a.materia_nombre || '').localeCompare(String(b.materia_sigla || b.materia_nombre || ''))
      );

  return (
    <div className="da-cal-semanal">
      <div className="da-cal-semanal__scroll">
        <table className="da-cal-semanal__table">
          <thead>
            <tr>
              <th className="da-cal-semanal__th da-cal-semanal__th--hora">Hora</th>
              {aulas.map((a) => (
                <th key={a.id} className="da-cal-semanal__th">{a.codigo}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.horarioId} className={idx % 2 === 0 ? 'da-cal-semanal__tr da-cal-semanal__tr--alt' : 'da-cal-semanal__tr'}>
                <th className="da-cal-semanal__td da-cal-semanal__td--hora">{r.label}</th>
                {aulas.map((a) => {
                  const items = getBloques(a.id, r.horarioId);
                  const hayConflicto = items.length > 1;
                  return (
                    <td
                      key={`${a.id}-${r.horarioId}`}
                      className={`da-cal-semanal__td ${dragHorarioId == null
                        ? ''
                        : Number(dragHorarioId) === Number(r.horarioId)
                          ? 'horarios-aulas-drop--allowed'
                          : 'horarios-aulas-drop--blocked'
                        }`}
                      onDragOver={
                        puedeEditar
                          ? (e) => {
                            if (dragHorarioId == null) return;
                            if (Number(dragHorarioId) === Number(r.horarioId)) {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }
                          }
                          : undefined
                      }
                      onDrop={
                        puedeEditar
                          ? (e) => {
                            let payload = null;
                            try {
                              payload = JSON.parse(e.dataTransfer?.getData(AULA_ASIGN_MIME) || '{}');
                            } catch {
                              payload = null;
                            }
                            const payloadHorarioId = Number(payload?.horarioId || dragHorarioId);
                            if (!payloadHorarioId || payloadHorarioId !== Number(r.horarioId)) {
                              onClearActiveDragHorarioId?.();
                              return;
                            }
                            onDropAsignacion(e, a.id, r.horarioId);
                            onClearActiveDragHorarioId?.();
                          }
                          : undefined
                      }
                    >
                      {items.map((item, idx) => {
                        const color = rgbOf(item?.curso_color_hex);
                        const chipStyle = color
                          ? {
                            borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
                            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.38)`,
                            boxShadow: `inset 0 0 0 1px rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`,
                          }
                          : undefined;
                        return (
                          <div
                            key={item.curso_horario_id}
                            className={`da-cal-semanal__chip da-cal-semanal__chip--draggable ${hayConflicto ? 'horarios-aulas-chip--conflicto' : ''}`}
                            draggable={puedeEditar}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData(
                                AULA_ASIGN_MIME,
                                JSON.stringify({
                                  cursoHorarioId: item.curso_horario_id,
                                  cursoId: item.curso_id,
                                  horarioId: item.horario_id,
                                })
                              );
                              onSetActiveDragHorarioId?.(item.horario_id);
                            }}
                            onDragEnd={() => onClearActiveDragHorarioId?.()}
                            style={{
                              ...(chipStyle || {}),
                              ...(hayConflicto
                                ? {
                                  zIndex: 20 + idx,
                                  position: 'relative',
                                  marginTop: idx === 0 ? 0 : -18,
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                }
                                : {}),
                            }}
                          >
                            <div className="da-cal-semanal__chip-hora">
                              {String(item.hora_inicio || '').slice(0, 5)}-{String(item.hora_fin || '').slice(0, 5)}
                            </div>
                            <div className="da-cal-semanal__chip-curso">{item.materia_sigla || item.materia_nombre}</div>
                            <div className="da-cal-semanal__chip-line">
                              {item.paralelo_nombre}
                              {item.paralelo_turno ? ` · ${item.paralelo_turno}` : ''}
                            </div>
                            {item.docente_nombre ? <div className="da-cal-semanal__chip-line">Docente: {item.docente_nombre}</div> : null}
                            {item.carrera_nombre ? <div className="da-cal-semanal__chip-line"><strong>{item.carrera_nombre}</strong></div> : null}
                            {item.periodo_nombre ? <div className="da-cal-semanal__chip-line">Periodo: {item.periodo_nombre}</div> : null}
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AulasAsignacionGrid;

