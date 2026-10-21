/**
 * Mapper de aplicación: PagoCapacitacion (módulo CAP)
 *
 * Convierte pagos de capacitación a formato de presentación:
 * - Filas crudas del historial (JOIN con metodos_pago/cuentas_pago, snake_case)
 * - Entidades del repositorio CRUD (respuesta de registrar pago)
 */

/**
 * Convierte una fila cruda del historial de pagos a presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function rowToPresentation(row) {
  if (!row) return null;

  return {
    id: row.id,
    monto: row.monto !== null && row.monto !== undefined ? Number(row.monto) : null,
    concepto: row.concepto ?? null,
    fechaPago: row.fecha_pago,
    numeroRecibo: row.numero_recibo,
    observaciones: row.observaciones ?? null,
    tieneComprobante: Boolean(Number(row.tiene_comprobante ?? 0)),
    comprobanteNombre: row.comprobante_nombre ?? null,
    metodoPagoId: row.metodo_pago_id ?? null,
    metodoPagoNombre: row.metodo_pago_nombre ?? null,
    cuentaPagoId: row.cuenta_pago_id ?? null,
    cuentaPagoTitular: row.cuenta_pago_titular ?? null,
    cuentaPagoNumero: row.cuenta_pago_numero ?? null,
    createdAt: row.created_at,
  };
}

/**
 * Convierte un array de filas crudas del historial a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function rowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(rowToPresentation);
}

/**
 * Convierte una entidad PagoCapacitacion (objeto de dominio) a presentación.
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function entityToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    capacitacionInscritoId: entity.capacitacionInscritoId,
    metodoPagoId: entity.metodoPagoId ?? null,
    cuentaPagoId: entity.cuentaPagoId ?? null,
    concepto: entity.concepto ?? null,
    monto: entity.monto !== null && entity.monto !== undefined ? Number(entity.monto) : null,
    fechaPago: entity.fechaPago,
    numeroRecibo: entity.numeroRecibo,
    observaciones: entity.observaciones ?? null,
    tieneComprobante: Boolean(entity.comprobanteRuta),
    comprobanteNombre: entity.comprobanteNombre ?? null,
    createdAt: entity.createdAt,
  };
}

/**
 * Clase mapper para PagoCapacitacion (patrón del módulo)
 */
export class PagoCapacitacionMapper {
  static rowToPresentation(row) {
    return rowToPresentation(row);
  }

  static rowsToPresentation(rows) {
    return rowsToPresentation(rows);
  }

  static entityToPresentation(entity) {
    return entityToPresentation(entity);
  }
}
