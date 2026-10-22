/**
 * Molécula: contenido de la tarjeta de curso del paso «Curso» de Inscribir
 * participante (CAP). Gemela de `ParaleloCard` (Matrícula) y de
 * `GrupoCapacitacionCard`: se pinta dentro del `Card` de `DataCards` y reutiliza
 * `paralelo-card*` (styles/pages/step2-periodo-materias.css) — icono grande +
 * título + pill de estado, y debajo la banda de métricas (curso, matrícula, cupo).
 *
 * El estado seleccionado lo marca `DataCards` con `.data-cards__card--active`;
 * aquí solo se declara la pill «Elegido», que el CSS revela en ese estado.
 * Recibe el curso ya mapeado; no llama hooks.
 */

import { CalendarOutlined, CheckCircleFilled, ReadOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { formatEstadoCurso, getEstadoCursoPillClass } from '@application-capacitacion/utils/capacitacionPills';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';

const PILL_BASE = 'cfg-materia-pill';

/** Columna de la banda de métricas: rótulo en versalitas + valor destacado. */
const Metrica = ({ label, children }) => (
  <div className="paralelo-card__metrica">
    <span className="paralelo-card__metrica-label">{label}</span>
    <span className="paralelo-card__metrica-valor">{children}</span>
  </div>
);

const CursoCapacitacionCard = ({ curso }) => {
  if (!curso) return null;

  const inscritos =
    curso.cupoMaximo != null
      ? `${curso.inscritosCount} / ${curso.cupoMaximo}`
      : String(curso.inscritosCount ?? 0);

  return (
    <div className="paralelo-card paralelo-card--info">
      <div className="paralelo-card__head">
        <span className="paralelo-card__inicial paralelo-card__inicial--icono" aria-hidden>
          <ReadOutlined />
        </span>
        <div className="paralelo-card__identidad">
          <h4 className="paralelo-card__title">{curso.titulo}</h4>
          {curso.fechasLabel ? (
            <p className="paralelo-card__desc">
              <CalendarOutlined aria-hidden /> {curso.fechasLabel}
            </p>
          ) : null}
        </div>
        <div className="paralelo-card__pills">
          <StatusPill
            label={formatEstadoCurso(curso.estado)}
            className={getEstadoCursoPillClass(curso.estado)}
          />
          <StatusPill
            label={
              <span className="paralelo-card__turno">
                <CheckCircleFilled aria-hidden />
                Elegido
              </span>
            }
            className={`${PILL_BASE} ${PILL_BASE}--primary paralelo-card__pill-elegido`}
          />
        </div>
      </div>

      <div className="paralelo-card__metricas">
        {curso.esGratuito ? (
          <Metrica label="Costo">
            <CursoGratuitoPill />
          </Metrica>
        ) : null}
        {curso.tieneCosto ? (
          <Metrica label="Curso">
            <CostoCursoLabel costo={curso.costo} />
          </Metrica>
        ) : null}
        {curso.cobraMatricula ? (
          <Metrica label="Matrícula">
            <CostoCursoLabel costo={curso.costoMatricula} />
          </Metrica>
        ) : null}
        <Metrica label="Inscritos">{inscritos}</Metrica>
      </div>
    </div>
  );
};

export default CursoCapacitacionCard;
