/**
 * Card de curso en Mis cursos — datos académicos y progreso por bimestre (calendario).
 */

import { Card, Progress, Tooltip, Typography } from 'antd';
import { Button } from '@atoms';
import {
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { calificacionesSectionCardProps } from '../utils/calificacionesSectionCard.js';

const ESTADO_BIMESTRE_DOT = {
  abierto: 'cal-curso-card__dot--en-curso',
  cerrado: 'cal-curso-card__dot--cerrado',
  futuro: 'cal-curso-card__dot--futuro',
};

const CursoCardBimestre = ({ bimestre, esVigente }) => {
  const { numero, estado, progreso, aprobados, reprobados, pendientes } = bimestre;
  const tipo = estado?.tipo ?? 'futuro';
  const dotClass = ESTADO_BIMESTRE_DOT[tipo] ?? ESTADO_BIMESTRE_DOT.futuro;

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
        <Tooltip title={estado?.etiqueta ?? '—'}>
          <span
            className={['cal-curso-card__dot', dotClass].join(' ')}
            role="img"
            aria-label={estado?.etiqueta ?? 'Estado del bimestre'}
          />
        </Tooltip>
      </div>
      <Tooltip
        title={
          tipo === 'abierto'
            ? `${progreso}% con al menos una nota en el cuaderno`
            : `${progreso}% con nota efectiva registrada`
        }
      >
        <Progress
          percent={progreso}
          size="small"
          showInfo={false}
          strokeColor={esVigente ? 'var(--color-primary, #196b45)' : undefined}
        />
      </Tooltip>
      <div className="cal-curso-card__bimestre-stats">
        {tipo === 'abierto' ? (
          <span title="Sin nota en cuaderno" className="cal-curso-card__stat-pendientes">
            Pend. {pendientes ?? 0}
          </span>
        ) : (
          <>
            <span title="Aprobados">
              <CheckCircleOutlined className="cal-curso-card__stat-icon--ok" />
              {aprobados}
            </span>
            <span title="Reprobados">
              <CloseCircleOutlined className="cal-curso-card__stat-icon--no" />
              {reprobados}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const CursoCard = ({ curso, cursoPath, bimestreVigente = null }) => {
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

      <Button variant="success" onClick={() => navigate(cursoPath(curso.id))}>
        Abrir curso
      </Button>
    </Card>
  );
};

export default CursoCard;
