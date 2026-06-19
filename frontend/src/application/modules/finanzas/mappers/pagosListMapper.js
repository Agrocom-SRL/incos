/**
 * Mapper: filas del API de pagos de aporte → forma de lista en UI (módulo Finanzas).
 *
 * Espejo de `docenteListMapper`: normaliza la fila cruda del backend
 * (vista_pago_aporte_listado, dataFieldName 'pagos') a un DTO estable para la
 * tabla, agregando `estudiante.nombreCompleto` en orden canónico
 * APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (vía `buildFullName`, no regex).
 */

import { buildFullName } from '@application/utils/formatters';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const pagoListMapper = (row) => {
  if (!row) return null;

  const estudianteRaw = row.estudiante || {};
  const gestionRaw = row.gestion || {};
  const becaRaw = row.beca || {};

  const nombreCompleto = buildFullName(
    estudianteRaw.nombre,
    estudianteRaw.apellidoPaterno,
    estudianteRaw.apellidoMaterno,
  );

  return {
    id: row.id,
    createdAt: row.created_at ?? null,
    estudiante: {
      id: estudianteRaw.id ?? null,
      nombre: estudianteRaw.nombre ?? null,
      apellidoPaterno: estudianteRaw.apellidoPaterno ?? null,
      apellidoMaterno: estudianteRaw.apellidoMaterno ?? null,
      codigoEstudiante: estudianteRaw.codigoEstudiante ?? null,
      nombreCompleto,
    },
    gestion: {
      id: gestionRaw.id ?? null,
      nombre: gestionRaw.nombre ?? null,
      anio: gestionRaw.anio ?? null,
    },
    becaNombre: becaRaw.nombre ?? null,
    becaPorcentaje: becaRaw.porcentaje != null ? Number(becaRaw.porcentaje) : null,
    montoBase: toNumber(row.monto_base),
    descuentoBeca: toNumber(row.descuento_beca),
    montoObligatorio: toNumber(row.monto_obligatorio),
    totalPagado: toNumber(row.total_pagado),
    cantidadPagos: toNumber(row.cantidad_pagos),
    saldoPendiente: toNumber(row.saldo_pendiente),
    estado: row.estado ?? null,
  };
};

export const mapPagosList = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(pagoListMapper).filter(Boolean);
};
