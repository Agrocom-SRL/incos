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
}) => {
  const getBloque = (aulaId, horarioId) =>
    (bloques || []).find(
      (b) =>
        Number(b.aula_id) === Number(aulaId) &&
        Number(b.horario_id) === Number(horarioId) &&
        Number(b.curso_horario_id) > 0
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
                  const item = getBloque(a.id, r.horarioId);
                  const color = rgbOf(item?.curso_color_hex);
                  return (
                    <td
                      key={`${a.id}-${r.horarioId}`}
                      className="da-cal-semanal__td"
                      onDragOver={puedeEditar ? (e) => e.preventDefault() : undefined}
                      onDrop={puedeEditar ? (e) => onDropAsignacion(e, a.id, r.horarioId) : undefined}
                    >
                      {item ? (
                        <div
                          className="da-cal-semanal__chip da-cal-semanal__chip--draggable"
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
                          }}
                          style={color ? { backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, .35)` } : undefined}
                        >
                          <div className="da-cal-semanal__chip-curso">{item.materia_sigla || item.materia_nombre}</div>
                          <div className="da-cal-semanal__chip-line">{item.paralelo_nombre}</div>
                        </div>
                      ) : null}
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

