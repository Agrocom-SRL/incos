/**
 * Grilla lunes–sábado × franjas horarias (calendario semanal del docente).
 */

import { useMemo } from 'react';
import DocenteHorarioSemanaCell from '@docentes/components/atoms/DocenteHorarioSemanaCell';

/** Días alineados al ENUM de `horarios.dia` en BD (sin DOMINGO en columnas). */
const DIA_DB_KEYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const DIA_HEADERS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_SEMANA = DIA_DB_KEYS.slice(0, 5);
const DIAS_SABADO = DIA_DB_KEYS.slice(5);

const SLOT_MINUTE_START = 8 * 60;
const SLOT_MINUTE_END = 22 * 60;

/** @param {unknown} v */
function horaToMinutes(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'string') {
    const m = v.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.getHours() * 60 + v.getMinutes();
  }
  return null;
}

/** Normaliza etiqueta de día a clave ENUM (mayúsculas, sin acentos). */
function normalizeDiaDb(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const allowed = new Set(DIA_DB_KEYS);
  return allowed.has(s) ? s : null;
}

/** @param {{ cursoCodigo?: string, cursoId?: number, cursoColorHex?: string|null, bloques?: object[] }[]} courseSchedules */
function flattenEvents(
  courseSchedules,
  clipStart = SLOT_MINUTE_START,
  clipEnd = SLOT_MINUTE_END,
) {
  const out = [];
  for (const c of courseSchedules || []) {
    const codigo = c.cursoCodigo || '—';
    const cursoId = c.cursoId ?? null;
    const color = c.cursoColorHex ?? null;
    const materiaNombre = c.materiaNombre ?? null;
    const materiaSigla = c.materiaSigla ?? null;
    const carrera = c.carrera ?? null;
    const periodoParalelo = c.periodoParalelo ?? null;
    const docente = c.docente ?? null;
    for (const b of c.bloques || []) {
      const dia = normalizeDiaDb(b.dia);
      const start = horaToMinutes(b.horaInicio);
      if (!dia || start == null) continue;
      if (start < clipStart || start >= clipEnd) continue;
      out.push({
        cursoId,
        cursoHorarioId: b.cursoHorarioId ?? null,
        cursoCodigo: codigo,
        cursoColorHex: color,
        diaDb: dia,
        startMinutes: start,
        horaInicio: b.horaInicio,
        horaFin: b.horaFin,
        aula: b.aula ?? null,
        turno: b.turno ?? null,
        paralelo: b.paralelo ?? null,
        materiaNombre,
        materiaSigla,
        carrera,
        periodoParalelo,
        docente,
        orden: b.orden,
      });
    }
  }
  return out;
}

/** @param {ReturnType<typeof flattenEvents>} events */
function buildCellMap(events, clipStart = SLOT_MINUTE_START, clipEnd = SLOT_MINUTE_END) {
  const map = new Map();
  for (const ev of events) {
    if (ev.startMinutes < clipStart || ev.startMinutes >= clipEnd) continue;
    const key = `${ev.diaDb}-${ev.startMinutes}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(ev);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => String(a.cursoCodigo).localeCompare(String(b.cursoCodigo)));
  }
  return map;
}

const slotsRange = (events, rangeStart = SLOT_MINUTE_START, rangeEnd = SLOT_MINUTE_END) => {
  const withinRange = events
    .map((ev) => ev.startMinutes)
    .filter((m) => m >= rangeStart && m < rangeEnd);

  if (!withinRange.length) {
    return [rangeStart];
  }

  return [...new Set(withinRange)].sort((a, b) => a - b);
};

const slotsRangeByDays = (events, dayKeys, rangeStart, rangeEnd) => {
  const allowed = new Set(dayKeys);
  return slotsRange(events.filter((ev) => allowed.has(ev.diaDb)), rangeStart, rangeEnd);
};

/** Une franjas regulares (paso fijo) con los horarios de inicio reales de los eventos. */
function mergeSlotsForRange(events, dayKeys, rangeStart, rangeEnd, stepMinutes) {
  const set = new Set();
  for (let m = rangeStart; m < rangeEnd; m += stepMinutes) {
    set.add(m);
  }
  const allowed = new Set(dayKeys);
  for (const ev of events) {
    if (!allowed.has(ev.diaDb)) continue;
    if (ev.startMinutes >= rangeStart && ev.startMinutes < rangeEnd) {
      set.add(ev.startMinutes);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Catálogo con inicios no equidistantes (p. ej. sábado en `horarios`): solo esas filas + inicios de eventos.
 * @param {number[]} fixedStartsMin — minutos de inicio válidos (orden arbitrario)
 */
function mergeSlotsForFixedStarts(events, dayKeys, fixedStartsMin, rangeStart, rangeEnd) {
  const set = new Set();
  for (const m of fixedStartsMin || []) {
    if (m >= rangeStart && m < rangeEnd) set.add(m);
  }
  const allowed = new Set(dayKeys);
  for (const ev of events) {
    if (!allowed.has(ev.diaDb)) continue;
    if (ev.startMinutes >= rangeStart && ev.startMinutes < rangeEnd) {
      set.add(ev.startMinutes);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Vista previa: filas cada `stepMinutes` de forma continua (sin mezclar inicios sueltos que rompen el paso).
 * Primera fila = primer inicio de evento en ese grupo de días, o `rangeStart` si no hay eventos.
 */
function uniformSlotsPreview(events, dayKeys, rangeStart, rangeEnd, stepMinutes) {
  const allowed = new Set(dayKeys);
  const evs = events.filter(
    (e) =>
      allowed.has(e.diaDb) && e.startMinutes >= rangeStart && e.startMinutes < rangeEnd,
  );
  const anchor = evs.length ? Math.min(...evs.map((e) => e.startMinutes)) : rangeStart;
  const out = [];
  for (let m = anchor; m < rangeEnd; m += stepMinutes) {
    out.push(m);
  }
  return out;
}

/** Mapa celda día×franja: eventos cuyo inicio cae en [slot, slot + step). */
function buildCellMapBucketed(events, dayKeys, slots, stepMinutes, rangeStart, rangeEnd) {
  const map = new Map();
  const allowed = new Set(dayKeys);
  for (const slot of slots) {
    for (const dia of dayKeys) {
      if (!allowed.has(dia)) continue;
      const key = `${dia}-${slot}`;
      const items = events.filter(
        (ev) =>
          ev.diaDb === dia &&
          ev.startMinutes >= slot &&
          ev.startMinutes < slot + stepMinutes &&
          ev.startMinutes >= rangeStart &&
          ev.startMinutes < rangeEnd,
      );
      items.sort((a, b) => String(a.cursoCodigo).localeCompare(String(b.cursoCodigo)));
      if (items.length) map.set(key, items);
    }
  }
  return map;
}

const allQuarterSlots = () => {
  const out = [];
  for (let m = SLOT_MINUTE_START; m < SLOT_MINUTE_END; m += 15) {
    out.push(m);
  }
  return out;
};

const fmtHourLabel = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const DocenteHorarioSemanalGrid = ({
  courseSchedules = [],
  CellComponent = DocenteHorarioSemanaCell,
  forceAllTimeSlots = false,
  /** Ventana horaria lun–vie (turno del paralelo). */
  gridTimeRange = null,
  /** Ventana horaria solo sábado (independiente; ej. tarde–noche). Si null, se usa `gridTimeRange`. */
  saturdayGridTimeRange = null,
  /** Paso de la grilla en minutos (p. ej. 45). Requiere `gridTimeRange`. */
  slotStepMinutes = null,
  /**
   * true = filas solo cada `slotStepMinutes` (vista lectura); eventos agrupados por franja.
   * false = mezcla franjas regulares + inicios reales (edición / drop fino).
   */
  uniformSlotGrid = false,
  editable = false,
  onSlotDrop,
  cellExtraProps = {},
}) => {
  const Cell = CellComponent;
  const gridStart = gridTimeRange?.start ?? SLOT_MINUTE_START;
  const gridEnd = gridTimeRange?.end ?? SLOT_MINUTE_END;
  const satStart = saturdayGridTimeRange?.start ?? gridStart;
  const satEnd = saturdayGridTimeRange?.end ?? gridEnd;
  const satFixedStarts = Array.isArray(saturdayGridTimeRange?.fixedSlotStartsMinutes)
    ? saturdayGridTimeRange.fixedSlotStartsMinutes
    : null;
  const clipStart = Math.min(gridStart, satStart);
  const clipEnd = Math.max(gridEnd, satEnd);
  const useMergedStepGrid =
    gridTimeRange != null && slotStepMinutes != null && Number(slotStepMinutes) > 0;

  const events = useMemo(
    () => flattenEvents(courseSchedules, clipStart, clipEnd),
    [courseSchedules, clipStart, clipEnd],
  );
  const allSlots = useMemo(() => allQuarterSlots(), []);
  const weekdaySlots = useMemo(() => {
    if (useMergedStepGrid && uniformSlotGrid) {
      return uniformSlotsPreview(events, DIAS_SEMANA, gridStart, gridEnd, slotStepMinutes);
    }
    if (useMergedStepGrid) {
      return mergeSlotsForRange(events, DIAS_SEMANA, gridStart, gridEnd, slotStepMinutes);
    }
    if (forceAllTimeSlots) return allSlots;
    return slotsRangeByDays(events, DIAS_SEMANA, gridStart, gridEnd);
  }, [
    events,
    forceAllTimeSlots,
    allSlots,
    useMergedStepGrid,
    uniformSlotGrid,
    gridStart,
    gridEnd,
    slotStepMinutes,
  ]);
  const saturdaySlots = useMemo(() => {
    if (useMergedStepGrid && satFixedStarts?.length) {
      return mergeSlotsForFixedStarts(events, DIAS_SABADO, satFixedStarts, satStart, satEnd);
    }
    if (useMergedStepGrid && uniformSlotGrid) {
      return uniformSlotsPreview(events, DIAS_SABADO, satStart, satEnd, slotStepMinutes);
    }
    if (useMergedStepGrid) {
      return mergeSlotsForRange(events, DIAS_SABADO, satStart, satEnd, slotStepMinutes);
    }
    if (forceAllTimeSlots) return allSlots;
    return slotsRangeByDays(events, DIAS_SABADO, satStart, satEnd);
  }, [
    events,
    forceAllTimeSlots,
    allSlots,
    useMergedStepGrid,
    uniformSlotGrid,
    satStart,
    satEnd,
    slotStepMinutes,
    satFixedStarts,
  ]);

  const cellMap = useMemo(() => {
    if (useMergedStepGrid && uniformSlotGrid) {
      const m = new Map();
      for (const [dayKeys, slots, r0, r1] of [
        [DIAS_SEMANA, weekdaySlots, gridStart, gridEnd],
        [DIAS_SABADO, saturdaySlots, satStart, satEnd],
      ]) {
        const part = buildCellMapBucketed(events, dayKeys, slots, slotStepMinutes, r0, r1);
        for (const [k, v] of part) m.set(k, v);
      }
      return m;
    }
    return buildCellMap(events, clipStart, clipEnd);
  }, [
    events,
    clipStart,
    clipEnd,
    useMergedStepGrid,
    uniformSlotGrid,
    weekdaySlots,
    saturdaySlots,
    slotStepMinutes,
    gridStart,
    gridEnd,
    satStart,
    satEnd,
  ]);

  const renderTable = (dayKeys, slots, caption, stripeBaseMinutes) => (
    <div
      className={`da-cal-semanal__subgrid ${
        dayKeys.length === 1 ? 'da-cal-semanal__subgrid--sabado' : 'da-cal-semanal__subgrid--semana'
      }`}
      key={caption}
    >
      <p className="da-cal-semanal__subgrid-title">{caption}</p>
      <table className="da-cal-semanal__table">
        <thead>
          <tr>
            <th scope="col" className="da-cal-semanal__th da-cal-semanal__th--hora">
              Hora
            </th>
            {dayKeys.map((dia) => (
              <th key={dia} scope="col" className="da-cal-semanal__th">
                {DIA_HEADERS[DIA_DB_KEYS.indexOf(dia)]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slotMinutes, rowIdx) => (
            <tr
              key={slotMinutes}
              className={
                (() => {
                  if (useMergedStepGrid && uniformSlotGrid) {
                    return rowIdx % 2 === 0
                      ? 'da-cal-semanal__tr da-cal-semanal__tr--alt'
                      : 'da-cal-semanal__tr';
                  }
                  if (useMergedStepGrid) {
                    const base = stripeBaseMinutes ?? gridStart;
                    return Math.floor((slotMinutes - base) / slotStepMinutes) % 2 === 0
                      ? 'da-cal-semanal__tr da-cal-semanal__tr--alt'
                      : 'da-cal-semanal__tr';
                  }
                  return Math.floor(slotMinutes / 15) % 2 === 0
                    ? 'da-cal-semanal__tr da-cal-semanal__tr--alt'
                    : 'da-cal-semanal__tr';
                })()
              }
            >
              <th scope="row" className="da-cal-semanal__td da-cal-semanal__td--hora">
                {fmtHourLabel(slotMinutes)}
              </th>
              {dayKeys.map((dia) => (
                <td
                  key={`${dia}-${slotMinutes}`}
                  className="da-cal-semanal__td"
                  onDragOver={
                    editable && onSlotDrop
                      ? (e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                      }
                      : undefined
                  }
                  onDrop={
                    editable && onSlotDrop
                      ? (e) => {
                          e.preventDefault();
                          onSlotDrop(e, dia, slotMinutes);
                      }
                      : undefined
                  }
                >
                  <Cell
                    items={cellMap.get(`${dia}-${slotMinutes}`) || []}
                    slotDia={dia}
                    slotMinutes={slotMinutes}
                    editable={editable}
                    {...cellExtraProps}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="da-cal-semanal">
      <div className="da-cal-semanal__scroll">
        {renderTable(DIAS_SEMANA, weekdaySlots, 'Lunes a viernes', gridStart)}
        {renderTable(DIAS_SABADO, saturdaySlots, 'Sábado', satStart)}
      </div>
    </div>
  );
};

export default DocenteHorarioSemanalGrid;
