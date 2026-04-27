/**
 * Una fila de bloque horario (día, hora, aula). Átomo para listados; la grilla semanal lo reutilizará.
 */

import { Tag } from 'antd';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const fmtHora = (t) => {
  if (t == null || t === '') return '—';
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
};

const DocenteHorarioBloqueRow = ({ bloque, accentHex }) => {
  const accent = sanitizeDocenteColorHex(accentHex);
  const hora =
    bloque.horaInicio || bloque.horaFin
      ? `${fmtHora(bloque.horaInicio)} – ${fmtHora(bloque.horaFin)}`
      : null;

  return (
    <div
      className="da-horario-row"
      style={accent ? { borderLeft: `3px solid ${accent}`, paddingLeft: 10, marginLeft: 0 } : { paddingLeft: 4 }}
    >
      <strong>{bloque.dia || '—'}</strong>
      {hora ? ` · ${hora}` : ''}
      {bloque.aula ? ` · ${bloque.aula}` : ''}
      {bloque.turno ? ` · Turno ${bloque.turno}` : ''}
      {bloque.paralelo ? ` · ${bloque.paralelo}` : ''}
      {bloque.bloqueNombre ? ` · ${bloque.bloqueNombre}` : ''}
      {bloque.tipoHorario ? (
        <Tag style={{ marginLeft: 8, marginTop: 0, marginBottom: 0 }}>{bloque.tipoHorario}</Tag>
      ) : null}
    </div>
  );
};

export default DocenteHorarioBloqueRow;
