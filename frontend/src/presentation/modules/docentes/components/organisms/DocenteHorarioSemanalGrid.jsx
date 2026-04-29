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

/** @param {{ cursoCodigo?: string, cursoColorHex?: string|null, bloques?: object[] }[]} courseSchedules */
function flattenEvents(courseSchedules) {
  const out = [];
  for (const c of courseSchedules || []) {
    const codigo = c.cursoCodigo || '—';
    const color = c.cursoColorHex ?? null;
    const materiaNombre = c.materiaNombre ?? null;
    const materiaSigla = c.materiaSigla ?? null;
    const carrera = c.carrera ?? null;
    const periodoParalelo = c.periodoParalelo ?? null;
    for (const b of c.bloques || []) {
      const dia = normalizeDiaDb(b.dia);
      const start = horaToMinutes(b.horaInicio);
      if (!dia || start == null) continue;
      out.push({
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
        orden: b.orden,
      });
    }
  }
  return out;
}

/** @param {ReturnType<typeof flattenEvents>} events */
function buildCellMap(events) {
  const map = new Map();
  for (const ev of events) {
    if (ev.startMinutes < SLOT_MINUTE_START || ev.startMinutes >= SLOT_MINUTE_END) continue;
    const key = `${ev.diaDb}-${ev.startMinutes}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(ev);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => String(a.cursoCodigo).localeCompare(String(b.cursoCodigo)));
  }
  return map;
}

const slotsRange = (events) => {
  const withinRange = events
    .map((ev) => ev.startMinutes)
    .filter((m) => m >= SLOT_MINUTE_START && m < SLOT_MINUTE_END);

  if (!withinRange.length) {
    return [SLOT_MINUTE_START];
  }

  return [...new Set(withinRange)].sort((a, b) => a - b);
};

const slotsRangeByDays = (events, dayKeys) => {
  const allowed = new Set(dayKeys);
  return slotsRange(events.filter((ev) => allowed.has(ev.diaDb)));
};

const fmtHourLabel = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const DocenteHorarioSemanalGrid = ({ courseSchedules = [] }) => {
  const events = useMemo(() => flattenEvents(courseSchedules), [courseSchedules]);
  const cellMap = useMemo(() => buildCellMap(events), [events]);
  const weekdaySlots = useMemo(() => slotsRangeByDays(events, DIAS_SEMANA), [events]);
  const saturdaySlots = useMemo(() => slotsRangeByDays(events, DIAS_SABADO), [events]);

  const renderTable = (dayKeys, slots, caption) => (
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
          {slots.map((slotMinutes) => (
            <tr
              key={slotMinutes}
              className={
                Math.floor(slotMinutes / 15) % 2 === 0
                  ? 'da-cal-semanal__tr da-cal-semanal__tr--alt'
                  : 'da-cal-semanal__tr'
              }
            >
              <th scope="row" className="da-cal-semanal__td da-cal-semanal__td--hora">
                {fmtHourLabel(slotMinutes)}
              </th>
              {dayKeys.map((dia) => (
                <td key={`${dia}-${slotMinutes}`} className="da-cal-semanal__td">
                  <DocenteHorarioSemanaCell items={cellMap.get(`${dia}-${slotMinutes}`) || []} />
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
        {renderTable(DIAS_SEMANA, weekdaySlots, 'Lunes a viernes')}
        {renderTable(DIAS_SABADO, saturdaySlots, 'Sábado')}
      </div>
    </div>
  );
};

export default DocenteHorarioSemanalGrid;
