/**
 * Tarjeta compacta de una asignación curso/materia/paralelo (carga académica).
 */

import { Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const vigenteColor = (v) => (v ? 'success' : 'default');

const DocenteAssignmentCard = ({ assignment: a, showActions = false, onEdit = null, onDelete = null }) => {
  const curso = sanitizeDocenteColorHex(a.cursoColorHex);
  const carrera = sanitizeDocenteColorHex(a.carreraColorHex);
  const accent = curso || carrera;
  const conflictos = a?.conflictos || {};
  const hasConflictos = Boolean(conflictos.hasConflictos) || Number(conflictos.total) > 0;
  const conflictResumen = [
    conflictos.horario ? 'horario' : null,
    conflictos.aula ? 'aula' : null,
    conflictos.curso ? 'curso' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={`da-carga__card${hasConflictos ? ' da-carga__card--conflict' : ''}`}
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
        {showActions && (onEdit || onDelete) ? (
          <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
            {onEdit ? (
              <Button
                size="small"
                variant="warning"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(a)}
                title="Editar asignación"
              />
            ) : null}
            {onDelete ? (
              <Button
                size="small"
                variant="error"
                icon={<DeleteOutlined />}
                onClick={() => onDelete?.(a)}
                title="Dar de baja asignación"
              />
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="da-carga__meta">
        {hasConflictos ? (
          <div className="da-carga__row da-carga__row--conflict">
            <span className="da-carga__row-label">Conflicto</span>
            <span className="da-carga__row-val">
              <Tag color="error" style={{ margin: 0 }}>
                {conflictResumen || 'Revisar asignación'}
              </Tag>
            </span>
          </div>
        ) : null}
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
