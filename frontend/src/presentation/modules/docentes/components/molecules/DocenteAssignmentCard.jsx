/**
 * Tarjeta compacta de una asignación curso/materia/paralelo (carga académica).
 */

import { Tag } from 'antd';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const vigenteColor = (v) => (v ? 'success' : 'default');

const DocenteAssignmentCard = ({ assignment: a }) => {
  const curso = sanitizeDocenteColorHex(a.cursoColorHex);
  const carrera = sanitizeDocenteColorHex(a.carreraColorHex);
  const accent = curso || carrera;

  return (
    <article
      className="da-carga__card"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
    >
      <div className="da-carga__card-head">
        <span
          className="da-carga__sigla"
          aria-hidden
          style={
            accent
              ? {
                  background: accent,
                  boxShadow: `0 2px 8px ${accent}66`,
                }
              : undefined
          }
        >
          {(a.siglaMateria || '—').slice(0, 6)}
        </span>
        <div>
          <p className="da-carga__materia-name">{a.materia || '—'}</p>
        </div>
      </div>
      <div className="da-carga__meta">
        <div className="da-carga__row">
          <span className="da-carga__row-label">Paralelo</span>
          <span className="da-carga__row-val">{a.paralelo || '—'}</span>
        </div>
        <div className="da-carga__row">
          <span className="da-carga__row-label">Turno</span>
          <span className="da-carga__row-val">{a.turnoParalelo || '—'}</span>
        </div>
        <div className="da-carga__row">
          <span className="da-carga__row-label">Horas / sem.</span>
          <span className="da-carga__row-val">{a.cargaHorariaSemanal ?? '—'}</span>
        </div>
        <div className="da-carga__row">
          <span className="da-carga__row-label">Vigente</span>
          <span className="da-carga__row-val">
            <Tag color={vigenteColor(a.vigente)} style={{ margin: 0 }}>
              {a.vigente ? 'Sí' : 'No'}
            </Tag>
          </span>
        </div>
        {a.fechaAsignacion ? (
          <div className="da-carga__row">
            <span className="da-carga__row-label">Asignación</span>
            <span className="da-carga__row-val">{a.fechaAsignacion}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default DocenteAssignmentCard;
