/**
 * Mapper: catálogo maestro Becas y descuentos (API → DTO UI, módulo Finanzas).
 *
 * Distinto del flujo legacy de asignación (`application/modules/estudiantes/`
 * mapea `estudiantes_becas`, NO este catálogo). `dataKey` (front) coincide con
 * el `dataFieldName` (back): becasDescuentos (listado) / becaDescuento (detalle).
 * Campos backend (BecaDescuentoMapper.entityToPresentation):
 *   { id, nombre, codigo, porcentaje, descripcion, requiereDocumentacion,
 *     requiereAprobacionRector, esAutomatica, tipoAutomatica, promedioMinimo, activo,
 *     cantidadAsignaciones, totalReferencias }
 */

const toBool = (value, fallback = false) =>
  value == null ? fallback : value === true || value === 1 || value === '1';

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Conteo de referencias (columna "Asignaciones"): número entero, 0 si no viene. */
const toCount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Normaliza una beca/descuento del catálogo maestro.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const becaDescuentoListMapper = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    nombre: raw.nombre ?? null,
    codigo: raw.codigo ?? null,
    porcentaje: toNumberOrNull(raw.porcentaje),
    descripcion: raw.descripcion ?? null,
    requiereDocumentacion: toBool(raw.requiereDocumentacion),
    requiereAprobacionRector: toBool(raw.requiereAprobacionRector),
    esAutomatica: toBool(raw.esAutomatica),
    tipoAutomatica: raw.tipoAutomatica ?? null,
    promedioMinimo: toNumberOrNull(raw.promedioMinimo),
    activo: toBool(raw.activo, true),
    // Concurrencia (columna "Asignaciones"): estudiantes con la beca asignada.
    cantidadAsignaciones: toCount(raw.cantidadAsignaciones),
    totalReferencias: toCount(raw.totalReferencias),
  };
};

/** Mapea el array de becas/descuentos del catálogo maestro. */
export const mapBecasDescuentosList = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw.map(becaDescuentoListMapper).filter(Boolean);
};

export default becaDescuentoListMapper;
