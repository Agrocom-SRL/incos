/**
 * Cabecera de ficha (patrón compartido con EstudiantesDetail / PagosDetail / BecaAsignacionDetail).
 * Estilos: presentation/styles/pages/detail-page.css (.sd-profile*).
 */

import { Tooltip } from 'antd';
import { EditOutlined, SolutionOutlined } from '@ant-design/icons';
import DocenteColorBar, { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import '@docentes/styles/docente-color-picker.css';

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
  onEditar,
  puedeEditar,
}) => {
  const accent = sanitizeDocenteColorHex(colorHex);
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
          className={`sd-profile__avatar${accent ? ' sd-profile__avatar--tinted' : ''}`}
          aria-hidden
          style={accent ? { '--docente-avatar-ring': accent } : undefined}
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
      <div className="sd-stat">
        <span className="sd-stat__label">Color</span>
        <span className="sd-stat__value">
          {accent ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <DocenteColorBar hex={accent} className="docente-color-picker-preview" />
              {accent}
            </span>
          ) : (
            'Sin asignar'
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
