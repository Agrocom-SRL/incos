/**
 * Tarjeta de curso (estilo wizard-selection-cards + acciones).
 */

import { BookOutlined, EditOutlined, FormOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const ACCENT_DEFAULT = { color: '#196b45', bg: '#e8f5ec' };

const CursoCalificacionCard = ({ curso, onRegistrarNotas, onConfigurarPlan }) => {
  const accentHex = sanitizeDocenteColorHex(curso.cursoColorHex) || sanitizeDocenteColorHex(curso.carreraColorHex);
  const accent = accentHex
    ? { color: accentHex, bg: `${accentHex}18` }
    : ACCENT_DEFAULT;
  const listo = Boolean(curso.planListo);

  return (
    <article
      className={`cal-curso-pick wizard-selection-cards__radio${listo ? ' cal-curso-pick--ready' : ''}`}
      style={{
        '--wizard-card-accent': accent.color,
        '--wizard-card-accent-bg': accent.bg,
      }}
    >
      <div className="wizard-selection-cards__inner">
        <div className="wizard-selection-cards__icon-wrap">
          <BookOutlined className="wizard-selection-cards__icon" />
        </div>
        <div className="wizard-selection-cards__body">
          <div className="wizard-selection-cards__label">{curso.materia || '—'}</div>
          <div className="cal-curso-pick__chips">
            {curso.siglaMateria ? (
              <span className="cal-curso-pick__chip cal-curso-pick__chip--sigla">{curso.siglaMateria}</span>
            ) : null}
            <span className={`cal-curso-pick__chip ${listo ? 'cal-curso-pick__chip--ok' : 'cal-curso-pick__chip--warn'}`}>
              {listo ? 'Plan listo' : 'Plan pendiente'}
            </span>
          </div>
          <div className="daa-cursos-card__meta" style={{ marginTop: 8 }}>
            {curso.cursoCodigo ? <div>Código: {curso.cursoCodigo}</div> : null}
            {curso.cargaHorariaSemanal != null ? (
              <div>{curso.cargaHorariaSemanal} h/semana</div>
            ) : null}
            {curso.periodoMateriaPlan ? <div>{curso.periodoMateriaPlan}</div> : null}
          </div>
        </div>
      </div>
      <div className="cal-curso-pick__actions">
        <ActionButton
          permiso="academico.calificacion.registrar.parcial"
          accion="CREAR"
          type="primary"
          size="small"
          icon={<FormOutlined />}
          onClick={() => onRegistrarNotas?.(curso.asignacionId)}
        >
          Registrar notas
        </ActionButton>
        <ActionButton
          permiso="academico.calificacion.periodo"
          accion="CREAR"
          size="small"
          buttonStyle="outlined"
          icon={<EditOutlined />}
          onClick={() => onConfigurarPlan?.(curso.asignacionId)}
        >
          Plan
        </ActionButton>
      </div>
    </article>
  );
};

export default CursoCalificacionCard;
