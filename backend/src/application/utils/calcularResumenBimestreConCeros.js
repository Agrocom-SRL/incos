/**
 * Resumen bimestral por componente: suma de puntos por actividad;
 * celda sin nota cuenta como 0.
 */

const redondear = (v) => Math.round(Number(v) * 100) / 100;

/**
 * @param {Array<{ id: number, componente: string }>} evaluaciones
 * @param {Map<string, number|null>} notasPorClave — clave `${estudianteId}::${evaluacionId}`
 * @param {number} estudianteId
 */
export const calcularComponentesEstudiante = (evaluaciones, notasPorClave, estudianteId) => {
  let teorico = 0;
  let practico = 0;

  for (const ev of evaluaciones ?? []) {
    const key = `${estudianteId}::${ev.id}`;
    const raw = notasPorClave.get(key);
    const puntos = raw != null && Number.isFinite(Number(raw)) ? Math.round(Number(raw)) : 0;

    if (ev.componente === 'PRACTICO') {
      practico += puntos;
    } else {
      teorico += puntos;
    }
  }

  return {
    teorico: redondear(teorico),
    practico: redondear(practico),
    total: redondear(teorico + practico),
  };
};
