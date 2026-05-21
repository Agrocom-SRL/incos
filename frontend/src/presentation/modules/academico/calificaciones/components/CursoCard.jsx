/**
 * Card de curso en Mis cursos — datos académicos y progreso por bimestre (calendario).
 */

import { Card, Tag, Button, Progress, Tooltip, Typography } from 'antd';
import {
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';

const ESTADO_BIMESTRE_COLOR = {
  abierto: 'processing',
  cerrado: 'default',
  futuro: 'default',
};

const CursoCardBimestre = ({ bimestre, esVigente }) => {
  const { numero, estado, progreso, aprobados, reprobados } = bimestre;

  return (
    <div
      className={[
        'cal-curso-card__bimestre',
        esVigente ? 'cal-curso-card__bimestre--vigente' : '',
        estado?.tipo === 'futuro' ? 'cal-curso-card__bimestre--futuro' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="cal-curso-card__bimestre-head">
        <span className="cal-curso-card__bimestre-num">B{numero}</span>
        <Tag
          color={ESTADO_BIMESTRE_COLOR[estado?.tipo] ?? 'default'}
          className="cal-curso-card__bimestre-estado"
        >
          {estado?.etiqueta ?? '—'}
        </Tag>
      </div>
      <Tooltip title={`${progreso}% de estudiantes con nota registrada`}>
        <Progress
          percent={progreso}
          size="small"
          showInfo={false}
          strokeColor={esVigente ? 'var(--color-primary, #196b45)' : undefined}
        />
      </Tooltip>
      <div className="cal-curso-card__bimestre-stats">
        <span title="Aprobados">
          <CheckCircleOutlined className="cal-curso-card__stat-icon--ok" />
          {aprobados}
        </span>
        <span title="Reprobados">
          <CloseCircleOutlined className="cal-curso-card__stat-icon--no" />
          {reprobados}
        </span>
      </div>
    </div>
  );
};

const CursoCard = ({ curso, cuadernoPath, bimestreVigente = null }) => {
  const navigate = useNavigate();

  return (
    <Card className="cal-curso-card" {...calificacionesSectionCardProps}>
      <div className="cal-curso-card__head">
        <BookOutlined className="cal-curso-card__icon" aria-hidden />
        <div className="cal-curso-card__titles">
          <Typography.Paragraph
            className="cal-curso-card__materia"
            ellipsis={{ rows: 2, tooltip: curso.materia }}
          >
            {curso.materia}
          </Typography.Paragraph>
          {curso.carrera ? (
            <span
              className="cal-curso-card__carrera-pill"
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

      <dl className="cal-curso-card__meta-grid">
        <div className="cal-curso-card__meta-item">
          <dt>Paralelo</dt>
          <dd>{curso.paralelo || '—'}</dd>
        </div>
        <div className="cal-curso-card__meta-item">
          <dt>Turno</dt>
          <dd>{curso.turno || '—'}</dd>
        </div>
        <div className="cal-curso-card__meta-item">
          <dt>Periodo</dt>
          <dd>{curso.periodo || '—'}</dd>
        </div>
        <div className="cal-curso-card__meta-item">
          <dt>
            <TeamOutlined /> Estudiantes
          </dt>
          <dd>{curso.estudiantes ?? 0}</dd>
        </div>
      </dl>

      {curso.bimestres?.length ? (
        <div className="cal-curso-card__bimestres">
          <p className="cal-curso-card__bimestres-title">Progreso por bimestre</p>
          <div className="cal-curso-card__bimestres-grid">
            {curso.bimestres.map((b) => (
              <CursoCardBimestre
                key={b.numero}
                bimestre={b}
                esVigente={Number(b.numero) === Number(bimestreVigente)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <Button
        type="primary"
        block
        className="cal-curso-card__action"
        onClick={() => navigate(cuadernoPath(curso.id))}
      >
        Abrir cuaderno
      </Button>
    </Card>
  );
};

export default CursoCard;
