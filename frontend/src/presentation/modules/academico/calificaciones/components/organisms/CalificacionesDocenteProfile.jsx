/**
 * Cabecera de contexto docente (patrón sd-profile).
 */

import { BookOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { getIniciales } from '@application-academico/calificaciones/utils/calificacionesDisplay';

const CalificacionesDocenteProfile = ({
  nombreCompleto,
  subtitulo,
  totalCursos = 0,
  totalParalelos = 0,
  planesListos = 0,
  planesPendientes = 0,
}) => (
  <div className="sd-profile cal-docente-profile">
    <div className="sd-profile__identity">
      <div className="sd-profile__avatar-wrap">
        <div className="sd-profile__avatar sd-profile__avatar--default" aria-hidden>
          <span>{getIniciales(nombreCompleto)}</span>
        </div>
        <span className="sd-profile__status-dot" />
      </div>
      <div className="sd-profile__name-block">
        <h1 className="sd-profile__name">{nombreCompleto || 'Docente'}</h1>
        <div className="sd-profile__meta">
          <p className="sd-profile__sub">
            <UserOutlined />
            {subtitulo || 'Carga académica vigente'}
          </p>
          {planesPendientes > 0 ? (
            <span className="sd-profile__admission-pill sd-profile__admission-pill--antiguo">
              {planesPendientes} plan{planesPendientes === 1 ? '' : 'es'} pendiente
              {planesPendientes === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="sd-profile__admission-pill sd-profile__admission-pill--nuevo">
              Planes al día
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="sd-profile__divider" />

    <div className="sd-profile__stats">
      <div className="sd-stat">
        <span className="sd-stat__label">Cursos</span>
        <span className="sd-stat__value sd-stat__value--primary">{totalCursos}</span>
      </div>
      <div className="sd-stat">
        <span className="sd-stat__label">Paralelos</span>
        <span className="sd-stat__value">
          <TeamOutlined style={{ marginRight: 6 }} />
          {totalParalelos}
        </span>
      </div>
      <div className="sd-stat">
        <span className="sd-stat__label">Planes listos</span>
        <span className="sd-stat__value">
          <BookOutlined style={{ marginRight: 6 }} />
          {planesListos} / {totalCursos || '—'}
        </span>
      </div>
    </div>
  </div>
);

export default CalificacionesDocenteProfile;
