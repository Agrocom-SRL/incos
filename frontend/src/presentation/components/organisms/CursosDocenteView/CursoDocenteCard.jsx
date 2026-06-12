/**
 * Card base de curso del docente (cabecera + metadatos + acción).
 * Compartida por Calificaciones (con progreso por bimestre vía `renderExtra`) y
 * Asistencia (sin extra). La acción la inyecta el consumidor vía `renderAction`.
 */

import { Card, Typography } from 'antd';
import { BookOutlined, TeamOutlined } from '@ant-design/icons';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import '@presentation/styles/components/curso-card.css';

const CursoDocenteCard = ({
  curso,
  renderExtra = null,
  renderAction = null,
}) => (
  <Card className="curso-card" {...sectionCardProps}>
    <div className="curso-card__head">
      <BookOutlined className="curso-card__icon" aria-hidden />
      <div className="curso-card__titles">
        <Typography.Paragraph
          className="curso-card__materia"
          ellipsis={{ rows: 2, tooltip: curso.materia }}
        >
          {curso.materia}
        </Typography.Paragraph>
        {curso.carrera ? (
          <span
            className="curso-card__carrera-pill"
            style={{
              borderColor: curso.carreraColor,
              color: curso.carreraColor,
            }}
          >
            {curso.carrera}
          </span>
        ) : null}
      </div>
    </div>

    <dl className="curso-card__meta-grid">
      <div className="curso-card__meta-item">
        <dt>Paralelo</dt>
        <dd>{curso.paralelo || '—'}</dd>
      </div>
      <div className="curso-card__meta-item">
        <dt>Turno</dt>
        <dd>{curso.turno || '—'}</dd>
      </div>
      <div className="curso-card__meta-item">
        <dt>Periodo</dt>
        <dd>{curso.periodo || '—'}</dd>
      </div>
      <div className="curso-card__meta-item">
        <dt>
          <TeamOutlined /> Estudiantes
        </dt>
        <dd>{curso.estudiantes ?? 0}</dd>
      </div>
    </dl>

    {renderExtra ? (
      <div className="curso-card__extra">{renderExtra}</div>
    ) : null}

    {renderAction}
  </Card>
);

export default CursoDocenteCard;
