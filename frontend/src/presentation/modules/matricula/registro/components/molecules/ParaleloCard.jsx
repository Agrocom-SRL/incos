/**
 * ParaleloCard — contenido de la tarjeta de paralelo del paso «Paralelo».
 *
 * Sigue el patrón de TARJETA INFORMATIVA del sistema (docs/referencia/
 * tarjeta-informativa.md, prioridad 1): cabecera con identidad + pill de estado,
 * divisor, y banda de métricas con rótulo en versalitas sobre el valor. El color
 * se reserva para las pills y los acentos (inicial, iconos de género); la
 * separación la hacen los divisores y la escala tipográfica, no los fondos.
 *
 * Molécula del módulo: pinta un paralelo ya mapeado (sin hooks ni fetch) dentro
 * del `Card` que aporta `DataCards`. El estado seleccionado lo marca `DataCards`
 * con `.data-cards__card--active`; aquí solo se declara la pill «Elegido», que
 * el CSS revela en ese estado (styles/pages/step2-periodo-materias.css).
 */

import {
  CheckCircleFilled,
  ManOutlined,
  MoonOutlined,
  SunFilled,
  SunOutlined,
  TeamOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { StatusPill } from '@atoms';

/**
 * Turno: color y icono. Mañana ámbar (sol), tarde azul (sol pleno), noche
 * violeta (luna) — mismas variantes que las pills del design system.
 */
const TURNOS = {
  MAÑANA: { variante: 'warning', Icon: SunOutlined },
  MANANA: { variante: 'warning', Icon: SunOutlined },
  TARDE: { variante: 'info', Icon: SunFilled },
  NOCHE: { variante: 'accent', Icon: MoonOutlined },
};

const TURNO_POR_DEFECTO = { variante: 'default', Icon: SunOutlined };

/** Estadísticas de inscritos (el backend puede enviar `estadisticas` o campos planos). */
function getParaleloStats(paralelo) {
  const est = paralelo?.estadisticas ?? {};
  return {
    total: est.totalInscritos ?? paralelo?.totalInscritos ?? 0,
    hombres: est.totalHombres ?? paralelo?.totalHombres ?? 0,
    mujeres: est.totalMujeres ?? paralelo?.totalMujeres ?? 0,
  };
}

/** Inicial del paralelo (la letra que lo distingue: «TERCERO A» → «A»). */
function getParaleloInicial(nombre, codigo) {
  const fuente = String(codigo || nombre || '').trim();
  if (!fuente) return '—';
  const ultimaPalabra = fuente.split(/\s+/).pop();
  return ultimaPalabra.slice(-1).toUpperCase();
}

/** Columna de la banda de métricas: rótulo en versalitas + valor destacado. */
const Metrica = ({ label, valor, icon, toneClass = '' }) => (
  <div className={`paralelo-card__metrica ${toneClass}`.trim()}>
    <span className="paralelo-card__metrica-label">
      {icon}
      {label}
    </span>
    <span className="paralelo-card__metrica-valor">{valor}</span>
  </div>
);

const ParaleloCard = ({ paralelo }) => {
  if (!paralelo) return null;

  const nombre = paralelo.nombre ?? paralelo.codigo ?? `Paralelo ${paralelo.id}`;
  const turno = String(paralelo.turno ?? '').trim();
  const { variante, Icon: TurnoIcon } = TURNOS[turno.toUpperCase()] ?? TURNO_POR_DEFECTO;
  const descripcion = paralelo.descripcion ?? '';
  const stats = getParaleloStats(paralelo);

  return (
    <div className={`paralelo-card paralelo-card--${variante}`}>
      <div className="paralelo-card__head">
        <span className="paralelo-card__inicial" aria-hidden>
          {getParaleloInicial(nombre, paralelo.codigo)}
        </span>
        <div className="paralelo-card__identidad">
          <h4 className="paralelo-card__title">{nombre}</h4>
          {descripcion ? <p className="paralelo-card__desc">{descripcion}</p> : null}
        </div>
        <div className="paralelo-card__pills">
          {turno ? (
            <StatusPill
              label={
                <span className="paralelo-card__turno">
                  <TurnoIcon aria-hidden />
                  {turno}
                </span>
              }
              className={`cfg-materia-pill cfg-materia-pill--${variante}`}
            />
          ) : null}
        </div>
      </div>

      {/* Tono de género: mismas clases globales que las listas
          (`cfg-genero-tone--m` azul / `--f` magenta, table-cells.css). */}
      <div className="paralelo-card__metricas">
        <Metrica
          label="Inscritos"
          valor={stats.total}
          icon={<TeamOutlined aria-hidden />}
          toneClass="paralelo-card__metrica--total"
        />
        <Metrica
          label="Hombres"
          valor={stats.hombres}
          icon={<ManOutlined aria-hidden />}
          toneClass="cfg-genero-tone--m"
        />
        <Metrica
          label="Mujeres"
          valor={stats.mujeres}
          icon={<WomanOutlined aria-hidden />}
          toneClass="cfg-genero-tone--f"
        />
      </div>
    </div>
  );
};

export default ParaleloCard;
