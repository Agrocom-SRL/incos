/**
 * Organismo: calendario anual (12 meses) que pinta cada periodo/etapa como rango
 * de color sobre los días. Refleja en vivo la edición de fechas del aside.
 */

import { useMemo } from 'react';
import { Empty } from 'antd';
import dayjs from 'dayjs';
import {
  colorPeriodo,
  periodoDeDia,
  mesesDelAnio,
} from '@application-institucional/actual/utils/periodosCalendario.js';
import { formatRangoFechas } from '@application-institucional/actual/utils/bimestresTimeline.js';
import CalendarMonthMini from '@institucional/actual/components/atoms/CalendarMonthMini';

const BimestresCalendarBoard = ({ periodos = [], anio }) => {
  const coloreados = useMemo(
    () => periodos.map((p) => ({ ...p, color: colorPeriodo(p) })),
    [periodos],
  );

  const getDiaInfo = useMemo(() => {
    return (iso) => {
      const p = periodoDeDia(iso, coloreados);
      return p ? { color: p.color, nombre: p.nombre } : null;
    };
  }, [coloreados]);

  const meses = useMemo(() => mesesDelAnio(anio), [anio]);
  const hoyISO = dayjs().format('YYYY-MM-DD');

  if (!periodos.length) {
    return <Empty description="Sin periodos para la gestión vigente" />;
  }

  return (
    <div className="bim-cal-board">
      <div className="bim-cal-board__grid">
        {meses.map(({ year, month }) => (
          <CalendarMonthMini
            key={`${year}-${month}`}
            year={year}
            month={month}
            getDiaInfo={getDiaInfo}
            hoyISO={hoyISO}
          />
        ))}
      </div>

      <ul className="bim-cal-legend">
        {coloreados.map((p) => (
          <li key={p.id} className="bim-cal-legend__item">
            <span className="bim-cal-legend__dot" style={{ backgroundColor: p.color }} aria-hidden />
            <span className="bim-cal-legend__name">{p.nombre}</span>
            <span className="bim-cal-legend__range">{formatRangoFechas(p.fechaInicio, p.fechaFin)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BimestresCalendarBoard;
