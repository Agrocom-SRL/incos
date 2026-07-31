/**
 * Organismo: cabecera de la ficha de sesión de refuerzo (TUT).
 *
 * Reusa el shell compartido `sd-profile` (detail-page.css, prefijos sd-* solo
 * para layout), gemelo de `CursoCapacitacionFichaHeader`. Estado de la sesión
 * con `StatusPill` del kit y métricas de fecha/horario, modalidad y
 * estudiantes. Botón editar (`sd-profile__edit-btn`) solo cuando la sesión
 * sigue programada. Recibe props ya mapeadas; no llama hooks (el gate de
 * permiso se resuelve en la página).
 */

import { Tooltip } from 'antd';
import { EditOutlined, ScheduleOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import {
  formatEstadoSesion,
  getEstadoSesionPillClass,
} from '@application-academico/acompanamiento/utils/acompanamientoPills';

const SesionFichaHeader = ({ sesion, puedeEditar = false, onEditar }) => {
  const subtitleParts = [sesion.cursoLabel, sesion.docenteNombre].filter(Boolean);
  const lugarLabel =
    sesion.modalidad === 'VIRTUAL'
      ? 'Virtual'
      : ['Presencial', sesion.aulaLabel].filter(Boolean).join(' · ');

  return (
    <div className="sd-profile">
      {puedeEditar && onEditar ? (
        <Tooltip title="Editar datos de la sesión">
          <button
            type="button"
            className="sd-profile__edit-btn"
            onClick={onEditar}
            aria-label="Editar sesión"
          >
            <EditOutlined />
          </button>
        </Tooltip>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--default" aria-hidden>
            <ScheduleOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{sesion.tema || 'Sesión de refuerzo'}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              {subtitleParts.join(' · ') || 'Sesión de refuerzo'}
            </p>
            <StatusPill
              label={formatEstadoSesion(sesion.estado)}
              className={getEstadoSesionPillClass(sesion.estado)}
            />
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">Fecha y horario</span>
          <span className="sd-stat__value sd-stat__value--primary">
            {[sesion.fechaLabel, sesion.horarioLabel].filter(Boolean).join(' · ') || '—'}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Modalidad</span>
          <span className="sd-stat__value">{lugarLabel}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Estudiantes</span>
          <span className="sd-stat__value">
            {sesion.estado === 'REALIZADA'
              ? `${sesion.participantesAsistieron} / ${sesion.participantesTotal} asistieron`
              : `${sesion.participantesTotal} convocados`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SesionFichaHeader;
