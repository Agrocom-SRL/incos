/**
 * Card de curso en la pantalla Mis cursos.
 */

import { Tag, Button } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const BADGE_COLOR = {
  'sin-evaluaciones': 'warning',
  'en-curso': 'processing',
  cerrado: 'success',
};

const CursoCard = ({ curso, cuadernoPath }) => {
  const navigate = useNavigate();

  return (
    <article className="cal-curso-card">
      <div className="cal-curso-card__head">
        <BookOutlined className="cal-curso-card__icon" aria-hidden />
        <div className="cal-curso-card__titles">
          <h3 className="cal-curso-card__materia">{curso.materia}</h3>
          <Tag color={BADGE_COLOR[curso.badge?.tipo] ?? 'default'} className="cal-curso-card__badge">
            {curso.badge?.texto ?? 'En curso'}
          </Tag>
        </div>
      </div>

      <p className="cal-curso-card__meta">
        Paralelo {curso.paralelo} · {curso.turno} · {curso.horasSemana} h/semana
      </p>
      <p className="cal-curso-card__meta">{curso.estudiantes} estudiantes</p>

      {curso.notasPendientes != null ? (
        <p className="cal-curso-card__pendientes">{curso.notasPendientes} notas pendientes</p>
      ) : null}

      <Button
        type="primary"
        block
        className="cal-curso-card__action"
        onClick={() => navigate(cuadernoPath(curso.id))}
      >
        Abrir cuaderno
      </Button>
    </article>
  );
};

export default CursoCard;
