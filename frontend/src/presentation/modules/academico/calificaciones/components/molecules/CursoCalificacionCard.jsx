/**
 * Tarjeta de curso clickeable para entrar al registro de notas o al plan.
 */

import { Tag } from 'antd';
import { EditOutlined, FormOutlined, TeamOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const CursoCalificacionCard = ({
  curso,
  onRegistrarNotas,
  onConfigurarPlan,
}) => {
  const accent = sanitizeDocenteColorHex(curso.cursoColorHex) || sanitizeDocenteColorHex(curso.carreraColorHex);

  return (
    <article
      className="da-carga__card cal-curso-card"
      style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}
      onClick={() => onRegistrarNotas?.(curso.asignacionId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRegistrarNotas?.(curso.asignacionId);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Registrar notas de ${curso.materia}`}
    >
      <div className="da-carga__card-head">
        <span
          className="da-carga__sigla"
          aria-hidden
          style={
            accent
              ? { background: accent, boxShadow: `0 2px 8px ${accent}66` }
              : undefined
          }
        >
          {(curso.siglaMateria || '—').slice(0, 6)}
        </span>
        <div>
          <p className="da-carga__materia-name">{curso.materia || '—'}</p>
          {curso.periodoMateriaPlan ? (
            <span className="cal-paralelo-meta">{curso.periodoMateriaPlan}</span>
          ) : null}
        </div>
      </div>
      <div className="cal-curso-card__badge">
        <Tag color={curso.planListo ? 'success' : 'warning'}>
          {curso.planListo ? 'Plan listo' : 'Plan pendiente'}
        </Tag>
      </div>
      <div className="da-carga__meta">
        <div className="da-carga__row">
          <span className="da-carga__row-label">Código curso</span>
          <span className="da-carga__row-val">{curso.cursoCodigo || '—'}</span>
        </div>
        <div className="da-carga__row">
          <span className="da-carga__row-label">Horas / sem.</span>
          <span className="da-carga__row-val">{curso.cargaHorariaSemanal ?? '—'}</span>
        </div>
      </div>
      <div className="cal-curso-card__actions" onClick={(e) => e.stopPropagation()}>
        <Button
          type="primary"
          size="small"
          icon={<FormOutlined />}
          onClick={() => onRegistrarNotas?.(curso.asignacionId)}
        >
          Registrar notas
        </Button>
        <Button
          size="small"
          buttonStyle="outlined"
          icon={<EditOutlined />}
          onClick={() => onConfigurarPlan?.(curso.asignacionId)}
        >
          Plan de calificaciones
        </Button>
      </div>
    </article>
  );
};

export default CursoCalificacionCard;
