/**
 * Indicador de plazo restante para carga de notas en el cuaderno.
 */

import { useMemo } from 'react';
import { calcularPlazoCuaderno } from '@application-academico/calificaciones/utils/bimestrePlazoUtils.js';

const BimestrePlazoCountdown = ({
  bimestreNum,
  fechaInicio,
  fechaFin,
  gestionFechaFin,
  mostrar = true,
}) => {
  const plazo = useMemo(
    () =>
      calcularPlazoCuaderno({
        bimestreNum,
        fechaInicio,
        fechaFin,
        gestionFechaFin,
      }),
    [bimestreNum, fechaInicio, fechaFin, gestionFechaFin],
  );

  if (!mostrar || !plazo.visible || plazo.diasRestantes == null) {
    return null;
  }

  const parpadeo = plazo.nivel === 'danger';
  const diasLabel =
    plazo.diasRestantes === 0
      ? 'hoy'
      : plazo.diasRestantes === 1
        ? '1 día'
        : `${plazo.diasRestantes} días`;

  return (
    <span
      className={`cal-bimestre-plazo cal-bimestre-plazo--${plazo.nivel}${parpadeo ? ' cal-bimestre-plazo--parpadeo' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="cal-bimestre-plazo__barra" aria-hidden>
        <span
          className="cal-bimestre-plazo__progreso"
          style={{ width: `${plazo.progresoPct}%` }}
        />
      </span>
      <span className="cal-bimestre-plazo__texto">
        {plazo.esUltimoBimestre ? (
          <>
            Quedan <strong>{diasLabel}</strong> para registrar notas antes del cierre de la{' '}
            <strong>gestión académica</strong>
            {plazo.fechaFinFmt ? (
              <>
                {' '}
                (<strong>{plazo.fechaFinFmt}</strong>)
              </>
            ) : null}
            .
          </>
        ) : (
          <>
            Quedan <strong>{diasLabel}</strong> disponibles para registrar notas en este bimestre
            {plazo.fechaFinFmt ? (
              <>
                {' '}
                (cierre: <strong>{plazo.fechaFinFmt}</strong>)
              </>
            ) : null}
            .
          </>
        )}
      </span>
    </span>
  );
};

export default BimestrePlazoCountdown;
