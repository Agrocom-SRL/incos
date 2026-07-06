/**
 * Formato compartido de la planilla de becas por carrera (reporte read-only).
 *
 * El detalle por carrera se pinta ahora en pestañas (una por carrera, ver
 * `BecasCarreraSection`), no como árbol expandible: por eso este archivo solo
 * conserva el formateador de porcentaje que siguen usando las bandas de
 * cabecera/total de esa sección.
 */

/** Porcentaje redondeado a ENTERO: "13%" (la planilla evita decimales). */
export const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${Math.round(safe).toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}%`;
};

export default formatPorcentaje;
