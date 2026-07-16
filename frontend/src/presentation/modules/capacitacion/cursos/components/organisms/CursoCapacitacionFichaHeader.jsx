/**
 * Organismo: cabecera de la ficha de curso de capacitación (CAP).
 *
 * Reusa el shell compartido `sd-profile` (detail-page.css, prefijos sd-* solo
 * para layout), gemelo de `PagoFichaHeader`. Estado del curso con `StatusPill`
 * y métricas de costo/cupo/bloques. Recibe props ya mapeadas; no llama hooks.
 */

import { ReadOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  formatEstadoCurso,
  getEstadoCursoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

const CursoCapacitacionFichaHeader = ({ curso }) => {
  const subtitleParts = [curso.fechasLabel, curso.aulaLabel].filter(Boolean);

  return (
    <div className="sd-profile">
      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--default" aria-hidden>
            <ReadOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{curso.titulo}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">{subtitleParts.join(' · ') || 'Curso de capacitación'}</p>
            <StatusPill
              label={formatEstadoCurso(curso.estado)}
              className={getEstadoCursoPillClass(curso.estado)}
            />
            {!curso.activo ? (
              <StatusPill label="Inactivo" className="cfg-materia-pill cfg-materia-pill--inactiva" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">Costo</span>
          <span className="sd-stat__value sd-stat__value--primary">Bs {formatBs(curso.costo)}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Inscritos</span>
          <span className="sd-stat__value">
            {curso.cupoMaximo != null
              ? `${curso.inscritosCount} / ${curso.cupoMaximo}`
              : curso.inscritosCount}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Bloques de horario</span>
          <span className="sd-stat__value">{curso.horariosCount}</span>
        </div>
      </div>
    </div>
  );
};

export default CursoCapacitacionFichaHeader;
