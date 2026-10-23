/**
 * Organismo: cabecera de la ficha de participante de capacitación (CAP).
 *
 * Reusa el shell compartido `sd-profile` (detail-page.css), gemelo de
 * `CursoCapacitacionFichaHeader`: identidad (CI + nombre), pill de estado,
 * botón editar y métricas del historial (cursos, vigentes y saldo pendiente).
 * Recibe props ya mapeadas; no llama hooks (el gate de permiso se resuelve en la página).
 */

import { Tooltip } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import { ESTADOS_INSCRIPCION_CAP_VIGENTES } from '@application-capacitacion/utils/capacitacionPills';

const ParticipanteFichaHeader = ({ participante, puedeEditar = false, onEditar }) => {
  const inscripciones = participante.inscripciones ?? [];
  const vigentes = inscripciones.filter((i) => ESTADOS_INSCRIPCION_CAP_VIGENTES.includes(i.estado));
  const saldoPendiente = vigentes.reduce((suma, i) => suma + (i.saldoTotal || 0), 0);

  return (
    <div className="sd-profile">
      {puedeEditar && onEditar ? (
        <Tooltip title="Editar datos del participante">
          <button
            type="button"
            className="sd-profile__edit-btn"
            onClick={onEditar}
            aria-label="Editar participante"
          >
            <EditOutlined />
          </button>
        </Tooltip>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--default" aria-hidden>
            <UserOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{participante.nombreCompleto}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              {participante.ciCompleto ? `CI ${participante.ciCompleto}` : 'Participante de capacitación'}
            </p>
            {participante.cursoActualTitulo ? (
              <StatusPill
                label={`Cursando: ${participante.cursoActualTitulo}`}
                className="cfg-materia-pill cfg-materia-pill--primary"
              />
            ) : null}
            {!participante.activo ? (
              <StatusPill label="Inactivo" className="cfg-materia-pill cfg-materia-pill--inactiva" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">Capacitaciones</span>
          <span className="sd-stat__value sd-stat__value--primary">{inscripciones.length}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Vigentes</span>
          <span className="sd-stat__value">{vigentes.length}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Saldo pendiente</span>
          <span className="sd-stat__value">Bs {formatBs(saldoPendiente)}</span>
        </div>
      </div>
    </div>
  );
};

export default ParticipanteFichaHeader;
