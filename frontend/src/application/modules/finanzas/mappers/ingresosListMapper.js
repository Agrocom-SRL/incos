/**
 * Mapper: filas del API de Registro de ingresos → forma de lista en UI
 * (módulo Finanzas).
 *
 * El backend (vista 184 vista_ingresos_listado, `IngresoMapper`) ya entrega el
 * payload en camelCase y con el nombre completo de la persona ya formateado en
 * orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (`personaNombreCompleto`);
 * este mapper solo coacciona tipos y aplica defaults — NO reordena ni
 * concatena el nombre (ya viene resuelto del backend).
 */

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const ingresoListMapper = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    origen: row.origen ?? null,
    referenciaId: row.referenciaId ?? null,
    numeroRecibo: row.numeroRecibo ?? null,
    fechaPago: row.fechaPago ?? null,
    monto: toNumber(row.monto),
    metodoPagoId: row.metodoPagoId ?? null,
    metodoPagoNombre: row.metodoPagoNombre ?? null,
    personaCodigo: row.personaCodigo ?? null,
    personaNombreCompleto: row.personaNombreCompleto || 'Sin nombre',
    concepto: row.concepto ?? null,
    descripcion: row.descripcion ?? null,
  };
};

export const mapIngresosList = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(ingresoListMapper).filter(Boolean);
};

export default mapIngresosList;
