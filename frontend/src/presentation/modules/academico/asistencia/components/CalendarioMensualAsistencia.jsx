/**
 * Calendario ANUAL de asistencia (organismo) — look del tablero de bimestres.
 *
 * Renderiza los 12 meses del año calendario y, sobre ese lienzo, pinta SOLO lo relevante:
 *  - Tinte del color del bimestre: días dentro de [rango.desde, rango.hasta].
 *  - Rojo (sin clase): días cubiertos por `actividadesSinClase` (feriado/receso/vacaciones).
 *  - Color primario sobre el tinte: días de horario (`esDiaClase`) en los que se debe tomar lista.
 *    DOT success cuando ya `tieneAsistencia`; borde de realce en `hoy`.
 *  - Meses/días fuera del bimestre: apagados.
 *
 * Interacción:
 *  - click en día de clase, no futuro y no neutro → `onElegirDia(fecha)` (arma esa semana).
 *  - click en día dentro del bimestre que NO es de horario, sin clase ni futuro lejano →
 *    `onDiaEspecial(fecha)` (abre el drawer de fecha especial precargado con esa fecha).
 *
 * El color del bimestre y los rangos de actividades vienen del backend (dato, no literal):
 * se inyectan vía `style` con color-mix usando ese hex sanitizado.
 */

import { useMemo } from 'react';
import { Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import {
  MESES_NOMBRES,
  DIAS_SEMANA,
  celdasDelMes,
  mesesDelAnio,
} from '@application-institucional/actual/utils/periodosCalendario.js';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { etiquetaDiaMes } from '@application-academico/asistencia/utils/asistenciaFechas.js';

const partes = (iso) => String(iso).split('-').map(Number);

/** Días ISO cubiertos por una actividad sin clase (fechaInicio..fechaFin, inclusivo). */
const expandirActividad = (actividad, set) => {
  const desde = String(actividad?.fechaInicio ?? '').slice(0, 10);
  const hasta = String(actividad?.fechaFin ?? actividad?.fechaInicio ?? '').slice(0, 10);
  if (!desde) return;
  const [ay, am, ad] = partes(desde);
  const fin = hasta || desde;
  // Avanza día a día por fecha UTC para no depender de zona horaria.
  let cursor = Date.UTC(ay, am - 1, ad);
  const finTs = (() => {
    const [by, bm, bd] = partes(fin);
    return Date.UTC(by, bm - 1, bd);
  })();
  let guard = 0;
  while (cursor <= finTs && guard < 400) {
    const d = new Date(cursor);
    const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
      d.getUTCDate(),
    ).padStart(2, '0')}`;
    set.add(iso);
    cursor += 86400000;
    guard += 1;
  }
};

const tituloDia = (dia, esSinClase, motivoSinClase) => {
  if (esSinClase) {
    return motivoSinClase
      ? `${etiquetaDiaMes(dia?.fechaClase ?? '')} · ${motivoSinClase}`
      : 'Sin clase';
  }
  if (!dia) return null;
  if (dia.esFuturo) return `${etiquetaDiaMes(dia.fechaClase)} · día futuro`;
  if (dia.neutro) return `${etiquetaDiaMes(dia.fechaClase)} · ${dia.motivo ?? dia.neutro}`;
  if (!dia.esDiaClase) return `${etiquetaDiaMes(dia.fechaClase)} · habilitar fecha especial`;
  return dia.tieneAsistencia
    ? `${etiquetaDiaMes(dia.fechaClase)} · asistencia tomada`
    : `${etiquetaDiaMes(dia.fechaClase)} · tomar asistencia`;
};

const DiaCelda = ({
  iso,
  numero,
  dia,
  enBimestre,
  esSinClase,
  motivoSinClase,
  esHoy,
  tinteStyle,
  onElegirDia,
  onDiaEspecial,
}) => {
  // Día de horario navegable → planilla. Día del bimestre sin horario ni sin-clase → especial.
  const navegableClase = Boolean(dia?.esDiaClase) && !dia?.esFuturo && !dia?.neutro;
  const habilitable =
    enBimestre &&
    !esSinClase &&
    !dia?.esDiaClase &&
    !dia?.esFuturo &&
    typeof onDiaEspecial === 'function';

  const className = [
    'asi-cal__dia',
    enBimestre ? 'asi-cal__dia--en-bimestre' : 'asi-cal__dia--fuera',
    esSinClase ? 'asi-cal__dia--sin-clase' : '',
    dia?.esDiaClase ? 'asi-cal__dia--clase' : '',
    dia?.esSesionEspecial ? 'asi-cal__dia--especial' : '',
    dia?.esFuturo ? 'asi-cal__dia--futuro' : '',
    esHoy ? 'asi-cal__dia--hoy' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const contenido = (
    <>
      <span className="asi-cal__dia-num">{numero}</span>
      {dia?.tieneAsistencia ? <span className="asi-cal__dot" aria-hidden /> : null}
    </>
  );

  // El tinte del bimestre se aplica solo a días dentro del rango (no a sin-clase).
  const estiloCelda = enBimestre && !esSinClase ? tinteStyle : undefined;
  const titulo = tituloDia(dia, esSinClase, motivoSinClase);

  if (navegableClase) {
    return (
      <Tooltip title={titulo}>
        <button
          type="button"
          className={`${className} asi-cal__dia--navegable`}
          style={estiloCelda}
          onClick={() => onElegirDia(dia.fechaClase)}
          aria-label={titulo ?? undefined}
        >
          {contenido}
        </button>
      </Tooltip>
    );
  }

  if (habilitable) {
    return (
      <Tooltip title={titulo}>
        <button
          type="button"
          className={`${className} asi-cal__dia--habilitable`}
          style={estiloCelda}
          onClick={() => onDiaEspecial(iso)}
          aria-label={titulo ?? undefined}
        >
          {contenido}
        </button>
      </Tooltip>
    );
  }

  const span = (
    <span className={className} style={estiloCelda} aria-disabled={dia?.esFuturo || undefined}>
      {contenido}
    </span>
  );
  return titulo ? <Tooltip title={titulo}>{span}</Tooltip> : span;
};

const MesBloque = ({
  year,
  month0,
  infoPorFecha,
  rango,
  diasSinClase,
  hoy,
  tinteStyle,
  onElegirDia,
  onDiaEspecial,
}) => {
  const celdas = celdasDelMes(year, month0);
  // Mes con al menos un día dentro del bimestre se muestra activo; el resto, apagado.
  const tieneActividad = celdas.some(
    (c) => c && rango && c.iso >= rango.desde && c.iso <= rango.hasta,
  );

  return (
    <div className={`asi-cal__mes${tieneActividad ? '' : ' asi-cal__mes--inactivo'}`}>
      <h4 className="asi-cal__mes-titulo">
        {MESES_NOMBRES[month0]} {year}
      </h4>
      <div className="asi-cal__grid">
        {DIAS_SEMANA.map((d, i) => (
          <span key={`dow-${i}`} className="asi-cal__dow">
            {d}
          </span>
        ))}
        {celdas.map((celda, i) => {
          if (!celda) return <span key={`hueco-${i}`} className="asi-cal__hueco" aria-hidden />;
          const enBimestre = rango ? celda.iso >= rango.desde && celda.iso <= rango.hasta : false;
          return (
            <DiaCelda
              key={celda.iso}
              iso={celda.iso}
              numero={celda.dia}
              dia={infoPorFecha.get(celda.iso) ?? null}
              enBimestre={enBimestre}
              esSinClase={diasSinClase.has(celda.iso)}
              motivoSinClase={diasSinClase.get?.(celda.iso) ?? null}
              esHoy={celda.iso === hoy}
              tinteStyle={tinteStyle}
              onElegirDia={onElegirDia}
              onDiaEspecial={onDiaEspecial}
            />
          );
        })}
      </div>
    </div>
  );
};

const CalendarioMensualAsistencia = ({
  dias = [],
  rango = null,
  actividadesSinClase = [],
  bimestreColor = null,
  anioCalendario = null,
  hoy = null,
  onElegirDia,
  onDiaEspecial,
}) => {
  const infoPorFecha = useMemo(() => {
    const m = new Map();
    for (const d of dias) m.set(d.fechaClase, d);
    return m;
  }, [dias]);

  // Map<iso, motivo> de los días cubiertos por actividades sin clase (rojo).
  const diasSinClase = useMemo(() => {
    const m = new Map();
    for (const act of actividadesSinClase) {
      const set = new Set();
      expandirActividad(act, set);
      for (const iso of set) {
        if (!m.has(iso)) m.set(iso, act?.nombre ?? 'Sin clase');
      }
    }
    return m;
  }, [actividadesSinClase]);

  const anio = useMemo(() => {
    if (anioCalendario) return Number(anioCalendario);
    if (rango?.desde) return Number(String(rango.desde).slice(0, 4));
    if (dias.length > 0) return Number(String(dias[0].fechaClase).slice(0, 4));
    return new Date().getFullYear();
  }, [anioCalendario, rango, dias]);

  const meses = useMemo(() => mesesDelAnio(anio), [anio]);

  // Color de marca del bimestre (dato del backend) → tinte sutil por color-mix.
  const colorBimestre = sanitizeDocenteColorHex(bimestreColor);
  const tinteStyle = colorBimestre
    ? {
        background: `color-mix(in srgb, ${colorBimestre} 18%, var(--color-bg-container))`,
        borderColor: `color-mix(in srgb, ${colorBimestre} 38%, transparent)`,
      }
    : undefined;

  return (
    <div className="asi-cal">
      <header className="asi-cal__header">
        <h3 className="asi-cal__titulo">
          <CalendarOutlined aria-hidden />
          Calendario del bimestre
        </h3>
        <p className="asi-cal__subtitulo">
          Cada mes pinta los días del bimestre; los días de clase resaltan en color para tomar
          lista.
        </p>
      </header>

      <div className="asi-cal__meses asi-cal__meses--anual">
        {meses.map(({ year, month }) => (
          <MesBloque
            key={`${year}-${month}`}
            year={year}
            month0={month}
            infoPorFecha={infoPorFecha}
            rango={rango}
            diasSinClase={diasSinClase}
            hoy={hoy}
            tinteStyle={tinteStyle}
            onElegirDia={onElegirDia}
            onDiaEspecial={onDiaEspecial}
          />
        ))}
      </div>

      <ul className="asi-cal__leyenda" aria-label="Referencias del calendario">
        <li className="asi-cal__leyenda-item">
          <span
            className="asi-cal__chip asi-cal__chip--bimestre"
            style={tinteStyle}
            aria-hidden
          />
          Días del bimestre
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--clase" />
          Día de clase
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--tomado">
            <span className="asi-cal__dot" aria-hidden />
          </span>
          Asistencia tomada
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--sin-clase" />
          Sin clase (feriado / receso)
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--hoy" />
          Hoy
        </li>
      </ul>
    </div>
  );
};

export default CalendarioMensualAsistencia;
