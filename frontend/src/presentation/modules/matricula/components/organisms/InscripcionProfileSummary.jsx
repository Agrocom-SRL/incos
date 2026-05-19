/**
 * Cabecera de ficha de matrícula (patrón sd-profile).
 */

import { Tooltip } from 'antd';
import {
  BookOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const InscripcionProfileSummary = ({
  avatarText,
  nombreCompleto,
  tipoInscripcion,
  student,
  management,
  subjectCount,
  historialEstadoInfo,
  puedeEditarInscripcion,
  canEdit,
  onEditar,
  puedeGenerarBoletaPdf,
  boletaInscripcion,
  generatingBoleta,
  studentId,
  onDownloadOrGenerateBoleta,
}) => (
  <div className="sd-profile">
    {puedeEditarInscripcion ? (
      <Tooltip
        title={
          historialEstadoInfo?.text === 'Historial pendiente'
            ? 'Completar historial de notas y editar'
            : 'Editar inscripción'
        }
      >
        <button
          type="button"
          className="sd-profile__edit-btn"
          onClick={onEditar}
          aria-label="Editar inscripción"
          disabled={!canEdit}
        >
          <EditOutlined />
        </button>
      </Tooltip>
    ) : null}

    <div className="sd-profile__identity">
      <div className="sd-profile__avatar-wrap">
        <div className="sd-profile__avatar sd-profile__avatar--default">{avatarText}</div>
        <span className="sd-profile__status-dot" />
      </div>
      <div className="sd-profile__name-block">
        <h1 className="sd-profile__name">{nombreCompleto || 'Estudiante sin nombre'}</h1>
        <div className="sd-profile__meta">
          <p className="sd-profile__sub">
            <BookOutlined /> Resumen de matrícula
          </p>
          {tipoInscripcion ? (
            <span className="sd-profile__admission-pill sd-profile__admission-pill--default">
              {tipoInscripcion}
            </span>
          ) : null}
        </div>
      </div>
    </div>

    <div className="sd-profile__divider" />

    <div className="sd-profile__stats">
      <div className="sd-stat">
        <span className="sd-stat__label">Código estudiante</span>
        <span className="sd-stat__value sd-stat__value--primary">{student?.codigoEstudiante || '—'}</span>
      </div>
      <div className="sd-stat">
        <span className="sd-stat__label">Gestión</span>
        <span className="sd-stat__value">
          {management?.nombre ? `${management.nombre}${management?.anio ? ` (${management.anio})` : ''}` : '—'}
        </span>
      </div>
      <div className="sd-stat">
        <span className="sd-stat__label">Materias</span>
        <span className="sd-stat__value">{subjectCount || 0}</span>
      </div>
    </div>

    <div className="sd-profile__divider" />

    <div className="sd-profile__actions">
      {puedeGenerarBoletaPdf ? (
        <button
          type="button"
          className="sd-btn sd-btn--primary"
          onClick={onDownloadOrGenerateBoleta}
          disabled={generatingBoleta || !studentId}
        >
          {boletaInscripcion ? <DownloadOutlined /> : <FileTextOutlined />}{' '}
          {boletaInscripcion ? 'Descargar boleta' : 'Generar boleta'}
        </button>
      ) : null}
    </div>
  </div>
);

export default InscripcionProfileSummary;
