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
import {
  ApartmentOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  StopOutlined,
  TableOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button } from '@atoms';
import { sectionCardProps } from '@presentation-utils/cards/sectionCardProps.js';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar.jsx';
import '@presentation/styles/components/curso-card.css';

const ParaleloCentralizadorCard = ({ paralelo, onAbrir }) => {
  const carreraColor = sanitizeDocenteColorHex(paralelo.carreraColorHex);
  // Sin estudiantes matriculados activos ⇒ tarjeta inactiva (no se entra a una
  // lista vacía). El resto de paralelos abre el centralizador del bimestre.
  const inactivo = (paralelo.cantidadEstudiantes ?? 0) === 0;
  const abrir = inactivo ? undefined : () => onAbrir?.(paralelo);
  return (
    <Card
      className={`curso-card curso-card--clickable cal-centralizador-pcard${
        inactivo ? ' cal-centralizador-pcard--inactivo' : ''
      }`}
      hoverable={!inactivo}
      onClick={abrir}
      aria-disabled={inactivo || undefined}
      {...sectionCardProps}
    >
      <div className="curso-card__head">
        <ApartmentOutlined className="curso-card__icon" aria-hidden />
        <div className="curso-card__titles">
          <Typography.Paragraph
            className="curso-card__materia"
            ellipsis={{ rows: 2, tooltip: paralelo.paraleloNombre }}
          >
            {paralelo.paraleloNombre || 'Paralelo sin nombre'}
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
          <dt>
            <CalendarOutlined /> Periodo
          </dt>
          <dd>{paralelo.periodoNombre || '—'}</dd>
        </div>
        <div className="curso-card__meta-item">
          <dt>
            <ClockCircleOutlined /> Turno
          </dt>
          <dd>{paralelo.turno || '—'}</dd>
        </div>
        <div className="curso-card__meta-item">
          <dt>
            <BookOutlined /> Asignaturas
          </dt>
          <dd>{paralelo.cursosCreados ?? paralelo.asignaturasRequeridas ?? '—'}</dd>
        </div>
        <div className="curso-card__meta-item">
          <dt>
            <TeamOutlined /> Docentes
          </dt>
          <dd>{paralelo.cantidadDocentes ?? '—'}</dd>
        </div>
      </dl>

      <div className="curso-card__action">
        {inactivo ? (
          <span className="cal-centralizador-pcard__sin-alumnos">
            <StopOutlined aria-hidden /> Sin estudiantes matriculados
          </span>
        ) : (
          <Button
            variant="success"
            icon={<TableOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onAbrir?.(paralelo);
            }}
          >
            Abrir centralizador
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ParaleloCentralizadorCard;
