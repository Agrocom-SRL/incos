/**
 * Cabecera de contexto del curso (plan / notas).
 */

import { BookOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { getIniciales } from '@application-academico/calificaciones/utils/calificacionesDisplay';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const CalificacionesCursoProfile = ({ curso, planListo }) => {
  if (!curso) return null;

  const accent = sanitizeDocenteColorHex(curso.cursoColorHex) || sanitizeDocenteColorHex(curso.carreraColorHex);
  const sigla = (curso.siglaMateria || curso.materia || '—').slice(0, 4).toUpperCase();

  return (
    <div className="sd-profile cal-curso-profile">
      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div
            className="sd-profile__avatar cal-curso-profile__avatar"
            aria-hidden
            style={accent ? { background: accent } : undefined}
          >
            <span>{sigla}</span>
          </div>
          <span className={`sd-profile__status-dot${planListo ? '' : ' sd-profile__status-dot--inactive'}`} />
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{curso.materia || '—'}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              <TeamOutlined />
              Paralelo {curso.paralelo}
              {curso.turnoParalelo ? ` · ${curso.turnoParalelo}` : ''}
            </p>
            <span
              className={`sd-profile__admission-pill ${
                planListo
                  ? 'sd-profile__admission-pill--nuevo'
                  : 'sd-profile__admission-pill--antiguo'
              }`}
            >
              {planListo ? 'Plan configurado' : 'Plan pendiente'}
            </span>
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">Gestión</span>
          <span className="sd-stat__value sd-stat__value--primary">{curso.gestion || '—'}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Código curso</span>
          <span className="sd-stat__value">
            <BookOutlined style={{ marginRight: 6 }} />
            {curso.cursoCodigo || '—'}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Horas / semana</span>
          <span className="sd-stat__value">
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            {curso.cargaHorariaSemanal ?? '—'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalificacionesCursoProfile;
