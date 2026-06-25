/**
 * Tarjeta de paralelo (P1 del Centralizador). Reutiliza el lenguaje visual de
 * CursoDocenteCard (clases `curso-card`), pero el sujeto es el PARALELO
 * (carrera + curso + paralelo + turno), no una asignatura.
 *
 * Click → P2 (bimestres del paralelo). El color de carrera viene de datos
 * (seeders) y se sanitiza con la utilidad central (excepción documentada de
 * inline-style en incos-ui-system §1).
 */

import { Card, Typography } from 'antd';
import { ApartmentOutlined, TeamOutlined } from '@ant-design/icons';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar.jsx';
import '@presentation/styles/components/curso-card.css';

const ParaleloCentralizadorCard = ({ paralelo, onAbrir }) => {
  const carreraColor = sanitizeDocenteColorHex(paralelo.carreraColorHex);
  return (
    <Card
      className="curso-card curso-card--clickable"
      hoverable
      onClick={() => onAbrir?.(paralelo)}
      {...sectionCardProps}
    >
      <div className="curso-card__head">
        <ApartmentOutlined className="curso-card__icon" aria-hidden />
        <div className="curso-card__titles">
          <Typography.Paragraph
            className="curso-card__materia"
            ellipsis={{ rows: 2, tooltip: paralelo.periodoNombre }}
          >
            {paralelo.periodoNombre || 'Curso sin nombre'}
          </Typography.Paragraph>
          {paralelo.carreraNombre ? (
            <span
              className="curso-card__carrera-pill"
              style={carreraColor ? { borderColor: carreraColor, color: carreraColor } : undefined}
            >
              {paralelo.carreraNombre}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="curso-card__meta-grid">
        <div className="curso-card__meta-item">
          <dt>Paralelo</dt>
          <dd>{paralelo.paraleloNombre || '—'}</dd>
        </div>
        <div className="curso-card__meta-item">
          <dt>Turno</dt>
          <dd>{paralelo.turno || '—'}</dd>
        </div>
        <div className="curso-card__meta-item">
          <dt>
            <ApartmentOutlined /> Asignaturas
          </dt>
          <dd>{paralelo.asignaturasRequeridas ?? '—'}</dd>
        </div>
        <div className="curso-card__meta-item">
          <dt>
            <TeamOutlined /> Cursos
          </dt>
          <dd>{paralelo.cursosCreados ?? '—'}</dd>
        </div>
      </dl>
    </Card>
  );
};

export default ParaleloCentralizadorCard;
