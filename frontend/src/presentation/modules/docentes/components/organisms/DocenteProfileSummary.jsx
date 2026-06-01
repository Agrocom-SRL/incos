/**
 * Cabecera de ficha docente — avatar con color de asignación solo si hay materias vinculadas.
 */

import { Tooltip } from 'antd';
import { EditOutlined, SolutionOutlined } from '@ant-design/icons';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const laborPillClass = (estado) => {
  const u = String(estado || '').toUpperCase();
  if (/\bACTIV/.test(u) || u === 'ACTIVO') {
    return 'sd-profile__admission-pill sd-profile__admission-pill--nuevo';
  }
  return 'sd-profile__admission-pill sd-profile__admission-pill--default';
};

const DocenteProfileSummary = ({
  nombreCompleto,
  iniciales,
  tituloProfesional,
  estadoLaboral,
  ciCompleto,
  celular,
  emailPersonal,
  registroActivo,
  colorHex,
  maxHorasSemana,
  hasMateriasAsignadas = false,
  onEditar,
  puedeEditar,
}) => {
  const accent = hasMateriasAsignadas ? sanitizeDocenteColorHex(colorHex) : null;

  return (
    <div className="sd-profile">
      {puedeEditar ? (
        <Tooltip title="Editar ficha del docente">
          <button type="button" className="sd-profile__edit-btn" onClick={onEditar} aria-label="Editar ficha del docente">
            <EditOutlined />
          </button>
        </Tooltip>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div
            className="sd-profile__avatar"
            aria-hidden
            style={
              accent
                ? {
                    background: accent,
                    boxShadow: `0 4px 14px color-mix(in srgb, ${accent} 45%, transparent)`,
                  }
                : undefined
            }
          >
            <span>{iniciales}</span>
          </div>
          <span className={`sd-profile__status-dot${registroActivo ? '' : ' sd-profile__status-dot--inactive'}`} />
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{nombreCompleto}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              <SolutionOutlined />
              {tituloProfesional || '—'}
            </p>
            {estadoLaboral ? <span className={laborPillClass(estadoLaboral)}>{estadoLaboral}</span> : null}
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">CI</span>
          <span className="sd-stat__value sd-stat__value--primary">{ciCompleto || '—'}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Celular</span>
          <span className="sd-stat__value">
            {celular ? (
              <a href={`tel:${celular}`} className="sd-link">
                {celular}
              </a>
            ) : (
              '—'
            )}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Correo</span>
          <span className="sd-stat__value">
            {emailPersonal ? (
              <a href={`mailto:${emailPersonal}`} className="sd-link">
                {emailPersonal}
              </a>
            ) : (
              '—'
            )}
          </span>
        </div>
        {maxHorasSemana != null ? (
          <div className="sd-stat">
            <span className="sd-stat__label">Máx. h/sem.</span>
            <span className="sd-stat__value">{maxHorasSemana}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DocenteProfileSummary;
