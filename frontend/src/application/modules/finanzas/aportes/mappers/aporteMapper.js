/**
 * Mapper: aporte de la gestión vigente (API → DTO UI, módulo Finanzas).
 *
 * Normaliza `configuracionAporte` (configuracion_aportes). Antes vivía en
 * `configPagosMapper.js` como tab de "Config. de pagos"; se movió aquí al
 * separar el aporte en su propia página `/finanzas/aportes` (permiso
 * `finanzas.aporte`, sin ELIMINAR).
 *
 * `dataKey` (front) coincide con el `dataFieldName` (back): configuracionAporte.
 */

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const toBool = (value, fallback = false) =>
  value == null ? fallback : value === true || value === 1 || value === '1';

/**
 * Normaliza la configuración de aporte (item de `configuracionesAportes`).
 * Campos del backend (ContributionConfigurationMapper):
 *   { id, gestionId, montoBase, aporteActivo, fechaInicio, fechaFin, activo, createdAt }
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapConfiguracionAporte = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id ?? null,
    gestionId: raw.gestionId ?? raw.gestion_id ?? null,
    montoBase: toNumber(raw.montoBase ?? raw.monto_base),
    aporteActivo: toBool(raw.aporteActivo ?? raw.aporte_activo, true),
    fechaInicio: raw.fechaInicio ?? raw.fecha_inicio ?? null,
    fechaFin: raw.fechaFin ?? raw.fecha_fin ?? null,
    activo: toBool(raw.activo, true),
  };
};

export default mapConfiguracionAporte;
