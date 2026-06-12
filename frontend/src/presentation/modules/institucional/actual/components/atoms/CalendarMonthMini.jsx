/**
 * Átomo: mini-calendario de un mes. Pinta cada día con el color tenue del periodo
 * que lo contiene (color de negocio sanitizado). El día de hoy se marca con borde.
 */

import { MESES_NOMBRES, DIAS_SEMANA, celdasDelMes } from '@application-institucional/actual/utils/periodosCalendario.js';

const CalendarMonthMini = ({ year, month, getDiaInfo, hoyISO }) => {
  const celdas = celdasDelMes(year, month);

  return (
    <div className="bim-cal-month">
      <div className="bim-cal-month__title">{MESES_NOMBRES[month]}</div>
      <div className="bim-cal-month__grid">
        {DIAS_SEMANA.map((d, i) => (
          <span key={`h-${i}`} className="bim-cal-month__wd">{d}</span>
        ))}
        {celdas.map((celda, i) => {
          if (!celda) return <span key={`e-${i}`} className="bim-cal-day bim-cal-day--empty" />;
          const info = getDiaInfo(celda.iso);
          const esHoy = celda.iso === hoyISO;
          const style = info?.color
            ? {
                backgroundColor: `color-mix(in srgb, ${info.color} 22%, #fff)`,
                color: `color-mix(in srgb, ${info.color} 75%, #111)`,
              }
            : undefined;
          const className = [
            'bim-cal-day',
            info ? 'bim-cal-day--painted' : '',
            esHoy ? 'bim-cal-day--hoy' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <span
              key={celda.iso}
              className={className}
              style={style}
              title={info ? `${celda.dia} — ${info.nombre}` : undefined}
            >
              {celda.dia}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonthMini;
