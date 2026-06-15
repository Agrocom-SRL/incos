/**
 * Helpers puros para el calendario anual de bimestres/etapas.
 * Trabaja con fechas en formato ISO 'YYYY-MM-DD' (comparación lexicográfica segura,
 * sin problemas de zona horaria) y con dayjs solo para construir las grillas de mes.
 */

import dayjs from 'dayjs';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

export const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Cabecera semanal lunes-primero (convención local). */
export const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Color fallback por división cuando el periodo no tiene `colorHex`. */
const COLOR_POR_DIVISION = {
  PLANIFICACION: '#6366f1',
  BIMESTRE: '#2196f3',
  CLAUSURA: '#9e9e9e',
  OTRO: '#10b981',
};

/** 'YYYY-MM-DD' (recorta cualquier sufijo de hora). */
export function toISODate(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

/** Normaliza un periodo del backend a la forma de lectura del calendario. */
export function mapPeriodoLectura(p = {}) {
  return {
    id: p.id,
    nombre: p.nombre,
    division: p.division,
    numeroOrden: p.numeroOrden ?? null,
    colorHex: p.colorHex ?? null,
    fechaInicio: toISODate(p.fechaInicio),
    fechaFin: toISODate(p.fechaFin),
  };
}

/** Color sanitizado del periodo (BD o fallback por división). */
export function colorPeriodo(periodo) {
  return (
    sanitizeDocenteColorHex(periodo?.colorHex) ||
    COLOR_POR_DIVISION[periodo?.division] ||
    COLOR_POR_DIVISION.OTRO
  );
}

function longitudDias(iniISO, finISO) {
  return Math.abs(dayjs(finISO).diff(dayjs(iniISO), 'day'));
}

/**
 * Periodo que contiene un día ISO. Ante solape, devuelve el de rango más corto
 * (más específico: un bimestre prevalece sobre planificación si ambos lo cubren).
 */
export function periodoDeDia(diaISO, periodos = []) {
  let best = null;
  let bestLen = Infinity;
  for (const p of periodos) {
    if (!p.fechaInicio || !p.fechaFin) continue;
    if (diaISO >= p.fechaInicio && diaISO <= p.fechaFin) {
      const len = longitudDias(p.fechaInicio, p.fechaFin);
      if (len < bestLen) {
        best = p;
        bestLen = len;
      }
    }
  }
  return best;
}

/** Lista de {year, month} para los 12 meses de un año. */
export function mesesDelAnio(anio) {
  return Array.from({ length: 12 }, (_, month) => ({ year: anio, month }));
}

/**
 * Celdas de un mes alineadas a semana lunes-primero. Cada celda es null (relleno)
 * o { iso, dia }. La longitud es múltiplo de 7.
 */
export function celdasDelMes(year, month) {
  const first = dayjs(new Date(year, month, 1));
  const offset = (first.day() + 6) % 7; // 0=lunes
  const diasEnMes = first.daysInMonth();
  const celdas = [];
  for (let i = 0; i < offset; i += 1) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    celdas.push({ iso, dia: d });
  }
  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}

/** Año a renderizar: el de la fecha de inicio de la gestión, o el año actual. */
export function anioDelCalendario(gestion) {
  if (gestion?.anio) return Number(gestion.anio);
  const ini = toISODate(gestion?.fechaInicio);
  if (ini) return Number(ini.slice(0, 4));
  return dayjs().year();
}
