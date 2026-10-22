/**
 * Molécula: contenido de la tarjeta de grupo del paso «Grupo y requisitos» de
 * Inscribir participante (CAP). Gemela de `ParaleloCard` (Matrícula): se pinta
 * dentro del `Card` que aporta `DataCards` y reutiliza su lenguaje visual
 * (`paralelo-card*`, styles/pages/step2-periodo-materias.css) — cabecera con
 * identidad + pills, y debajo los horarios con `InfoLinesCell`.
 *
 * El estado seleccionado lo marca `DataCards` con `.data-cards__card--active`;
 * aquí solo se declara la pill «Elegido», que el CSS revela en ese estado.
 * El cupo es una pill: verde con cupos, ámbar si el grupo está lleno (el cupo
 * es informativo, no bloquea), neutra si el grupo no tiene tope.
 *
 * Recibe el grupo ya mapeado (`mapGrupoCurso`); no llama hooks.
 */

import { CheckCircleFilled, ClockCircleOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { InfoLinesCell, StatusPill } from '@atoms';

const PILL_BASE = 'cfg-materia-pill';

/** Pill del cupo: etiqueta y variante según el cupo disponible. */
const buildCupoPill = (grupo) => {
  if (grupo.cupoDisponible == null) {
    return { label: 'Sin tope de cupo', variante: 'default' };
  }
  if (grupo.cupoDisponible === 0) {
    return { label: 'Cupo completo', variante: 'warning' };
  }
  return {
    label: `${grupo.cupoDisponible} ${grupo.cupoDisponible === 1 ? 'cupo' : 'cupos'}`,
    variante: 'success',
  };
};

const GrupoCapacitacionCard = ({ grupo }) => {
  if (!grupo) return null;

  const cupo = buildCupoPill(grupo);
  const horarios = (grupo.horarios ?? []).filter((h) => h?.etiqueta);

  const lineas = [
    ...(horarios.length > 0
      ? horarios.map((h, index) => ({
          key: `h-${index}`,
          icon: <ClockCircleOutlined />,
          label: h.etiqueta,
        }))
      : [{ key: 'sin-horarios', icon: <ClockCircleOutlined />, label: 'Sin horarios definidos' }]),
    grupo.aulaLabel ? { key: 'aula', icon: <EnvironmentOutlined />, label: grupo.aulaLabel } : null,
  ].filter(Boolean);

  return (
    <div className="paralelo-card paralelo-card--info">
      <div className="paralelo-card__head">
        <span className="paralelo-card__inicial paralelo-card__inicial--icono" aria-hidden>
          <TeamOutlined />
        </span>
        <div className="paralelo-card__identidad">
          <h4 className="paralelo-card__title">{grupo.nombre}</h4>
        </div>
        <div className="paralelo-card__pills">
          <StatusPill label={cupo.label} className={`${PILL_BASE} ${PILL_BASE}--${cupo.variante}`} />
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

      <InfoLinesCell lines={lineas} />
    </div>
  );
};

export default GrupoCapacitacionCard;
