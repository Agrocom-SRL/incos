/**
 * Mapper de aplicación: Ingreso (módulo Finanzas · "Registro de ingresos")
 *
 * Convierte filas crudas (snake_case) de la vista 184 (vista_ingresos_listado)
 * al formato de presentación camelCase. Une transacciones de aportes
 * académicos (pago_cuotas) y de pagos de capacitación (capacitacion_pagos)
 * bajo un mismo contrato.
 *
 * El id público de fila se arma aquí (no en SQL): `${origen}-${id_local}`,
 * porque id_local es la PK de la tabla transaccional de origen y NO es único
 * entre orígenes (puede repetirse entre pago_cuotas y capacitacion_pagos).
 *
 * Nombre completo en orden institucional: APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES (mismo criterio que el resto del proyecto, ver TeacherListMapper.js).
 */

/**
 * Fila de la vista 184 → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function ingresoRowToPresentation(row) {
  if (!row) return null;

  const personaNombreCompleto =
    [row.persona_apellido_paterno, row.persona_apellido_materno, row.persona_nombres]
      .filter(Boolean)
      .join(' ')
      .trim() || null;

  return {
    id: `${row.origen}-${row.id_local}`,
    origen: row.origen,
    referenciaId: row.referencia_id ?? null,
    numeroRecibo: row.numero_recibo ?? null,
    fechaPago: row.fecha_pago ?? null,
    monto: row.monto !== null && row.monto !== undefined ? Number(row.monto) : 0,
    metodoPagoId: row.metodo_pago_id ?? null,
    metodoPagoNombre: row.metodo_pago_nombre ?? null,
    personaCodigo: row.persona_codigo ?? null,
    personaApellidoPaterno: row.persona_apellido_paterno ?? null,
    personaApellidoMaterno: row.persona_apellido_materno ?? null,
    personaNombres: row.persona_nombres ?? null,
    personaNombreCompleto,
    concepto: row.concepto ?? null,
    descripcion: row.descripcion ?? null,
  };
}

/**
 * Filas de la vista 184 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function ingresoRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(ingresoRowToPresentation);
}

/**
 * Clase mapper para Ingreso (patrón del módulo)
 */
export class IngresoMapper {
  static rowToPresentation(row) {
    return ingresoRowToPresentation(row);
  }

  static rowsToPresentation(rows) {
    return ingresoRowsToPresentation(rows);
  }
}
