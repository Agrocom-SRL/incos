/**
 * Normaliza periodos devueltos por API de plan de estudios.
 */
export const mapPeriodosPlanList = (raw) => {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((per) => ({
    id: per.id ?? per.periodo_id,
    value: per.id ?? per.periodo_id,
    numero: per.numero ?? per.periodo_numero,
    periodoNumero: per.numero ?? per.periodo_numero,
    nombre: per.nombre,
    periodoNombre: per.nombre,
    descripcion: per.descripcion ?? null,
    label: per.nombre || (per.numero != null ? `${per.numero}º año` : `Periodo #${per.id}`),
  }));
};
