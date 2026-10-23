/**
 * Organismo: cabecera de la ficha de curso de capacitación (CAP).
 *
 * Reusa el shell compartido `sd-profile` (detail-page.css, prefijos sd-* solo
 * para layout), gemelo de `PagoFichaHeader`. Estado del curso con `StatusPill`
 * y métricas de costo/cupo/bloques. Botón editar (`sd-profile__edit-btn`)
 * igual al de `EstudiantesDetail`/`ParaleloDetalleInstanciaCard`. Recibe props
 * ya mapeadas; no llama hooks (el gate de permiso se resuelve en la página).
 */

import { Tooltip } from 'antd';
import { EditOutlined, ReadOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import {
  formatEstadoCurso,
  getEstadoCursoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';

const CursoCapacitacionFichaHeader = ({ curso, puedeEditar = false, onEditar }) => {
  const subtitleParts = [curso.modalidadLabel, curso.fechasLabel].filter(Boolean);

  return (
    <div className="sd-profile">
      {puedeEditar && onEditar ? (
        <Tooltip title="Editar datos del curso">
          <button
            type="button"
            className="sd-profile__edit-btn"
            onClick={onEditar}
            aria-label="Editar curso"
          >
            <EditOutlined />
          </button>
        </Tooltip>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--default" aria-hidden>
            <ReadOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{curso.tituloCompleto}</h1>
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
        {curso.esGratuito ? (
          <div className="sd-stat">
            <span className="sd-stat__label">Costo</span>
            <span className="sd-stat__value sd-stat__value--primary">
              <CursoGratuitoPill />
            </span>
          </div>
        ) : null}
        {curso.tieneCosto ? (
          <div className="sd-stat">
            <span className="sd-stat__label">Costo del curso</span>
            <span className="sd-stat__value sd-stat__value--primary">
              <CostoCursoLabel costo={curso.costo} />
            </span>
          </div>
        ) : null}
        <div className="sd-stat">
          <span className="sd-stat__label">Inscritos</span>
          <span className="sd-stat__value">
            {curso.cupoMaximo != null
              ? `${curso.inscritosCount} / ${curso.cupoMaximo}`
              : curso.inscritosCount}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Grupos</span>
          <span className="sd-stat__value">{curso.grupos.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CursoCapacitacionFichaHeader;
