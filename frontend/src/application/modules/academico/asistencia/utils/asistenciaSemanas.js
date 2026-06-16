/**
 * Cálculo de semanas (lun–sáb) acotadas al rango del bimestre, para la navegación
 * de la planilla semanal. Trabaja con fechas ISO (YYYY-MM-DD) sin tocar zonas horarias.
 */

const MS_DIA = 86400000;

/** Parsea 'YYYY-MM-DD' a Date en UTC (evita corrimiento por zona horaria). */
const aFecha = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** Serializa un Date UTC a 'YYYY-MM-DD'. */
export const aIso = (fecha) => fecha.toISOString().slice(0, 10);

/** Suma (o resta) días a una fecha ISO. */
export const sumarDias = (iso, n) => aIso(new Date(aFecha(iso).getTime() + n * MS_DIA));

/** Recorta una fecha ISO dentro de [desde, hasta]. */
const acotar = (iso, desde, hasta) => {
  if (iso < desde) return desde;
  if (iso > hasta) return hasta;
  return iso;
};

/**
 * Semana (lun–sáb) que contiene `fecha`, recortada al rango del bimestre.
 * @param {string} fecha ISO dentro del bimestre
 * @param {{ desde: string, hasta: string }} rango límites del bimestre
 * @returns {{ desde: string, hasta: string }}
 */
export const semanaDeFecha = (fecha, rango) => {
  const f = aFecha(fecha);
  // getUTCDay: 0=domingo … 6=sábado. Lunes como inicio de semana.
  const dow = f.getUTCDay();
  const offsetLunes = dow === 0 ? 6 : dow - 1;
  const lunes = aIso(new Date(f.getTime() - offsetLunes * MS_DIA));
  const sabado = sumarDias(lunes, 5);
  return {
    desde: acotar(lunes, rango.desde, rango.hasta),
    hasta: acotar(sabado, rango.desde, rango.hasta),
  };
};

/** Semana anterior, o null si saldría del rango. */
export const semanaAnterior = (semana, rango) => {
  const lunesPrevio = sumarDias(semana.desde, -7);
  if (lunesPrevio < rango.desde && semana.desde <= rango.desde) return null;
  return semanaDeFecha(acotar(lunesPrevio, rango.desde, rango.hasta), rango);
};

/** Semana siguiente, o null si saldría del rango. */
export const semanaSiguiente = (semana, rango) => {
  const lunesSiguiente = sumarDias(semana.desde, 7);
  if (lunesSiguiente > rango.hasta) return null;
  return semanaDeFecha(lunesSiguiente, rango);
};
