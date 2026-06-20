/**
 * Mapper: detalle de pago de aporte (API → DTO de ficha, módulo Finanzas).
 *
 * Espejo de `docenteDetailMapper`: normaliza la respuesta del backend a una forma
 * estable para la ficha. El módulo Finanzas es independiente del legacy `@pagos`.
 *
 * Origen de los datos (dos endpoints de la infraestructura compartida):
 *   - GET /api/v1/pagos-aportes/:id  (dataFieldName 'pago')  → cabecera + estudiante + gestión.
 *     Campos snake_case relevantes: monto_base, descuento_beca, monto_obligatorio, estado;
 *     y nested `estudiante` { id, nombre, apellidoPaterno, apellidoMaterno, ci, expedicion,
 *     codigoEstudiante }, `gestion` { id, nombre, anio, codigo }.
 *   - GET /api/v1/pagos-aportes/estado-registro  → total_pagado, saldo_pendiente, cantidad_pagos
 *     y `cuotas[]` { id, numero_recibo, fecha_pago, monto, metodo_pago {nombre,codigo},
 *     cuenta_pago {nombre_titular,numero_cuenta,numero_celular}, numero_transaccion,
 *     codigo_comprobante, observacion }.
 *
 * El nombre completo se arma en orden canónico APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
 * vía `buildFullName` (nunca regex ni join manual).
 */

import { buildFullName } from '@application/utils/formatters';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/** Mapea una fila de cuota (estado-registro.cuotas[]) a un DTO estable para la tabla. */
export const mapCuota = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const metodoPago = raw.metodo_pago || null;
  const cuentaPago = raw.cuenta_pago || null;

  const metodoNombre = metodoPago
    ? cleanText(metodoPago.nombre) || cleanText(metodoPago.codigo)
    : null;

  const cuentaPartes = cuentaPago
    ? [
        cleanText(cuentaPago.nombre_titular),
        cuentaPago.numero_cuenta ? `Cuenta ${cuentaPago.numero_cuenta}` : null,
        cuentaPago.numero_celular ? `Cel. ${cuentaPago.numero_celular}` : null,
      ].filter(Boolean)
    : [];

  return {
    id: raw.id ?? null,
    numeroRecibo: cleanText(raw.numero_recibo),
    fechaPago: raw.fecha_pago ?? null,
    monto: toNumber(raw.monto),
    metodoNombre,
    metodoCodigo: metodoPago ? cleanText(metodoPago.codigo) : null,
    // Ids planos del estado-registro (necesarios para precargar el form de edición).
    metodoPagoId: raw.metodo_pago_id ?? null,
    cuentaPagoId: raw.cuenta_pago_id ?? null,
    cuenta: cuentaPartes.length ? cuentaPartes.join(' · ') : null,
    numeroTransaccion: cleanText(raw.numero_transaccion),
    codigoComprobante: cleanText(raw.codigo_comprobante),
    descripcion: cleanText(raw.observacion ?? raw.descripcion),
  };
};

/**
 * Normaliza la respuesta del detalle de pago (cabecera + estudiante/gestión).
 * @param {Object} raw - Objeto `pago` del backend (dataFieldName 'pago').
 * @returns {Object|null} DTO de ficha con profile/gestion/montos/estado.
 */
export function mapPagoDetailFromApi(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const estudianteRaw = raw.estudiante || {};
  const gestionRaw = raw.gestion || {};

  const nombreCompleto = buildFullName(
    estudianteRaw.nombre,
    estudianteRaw.apellidoPaterno,
    estudianteRaw.apellidoMaterno,
  );

  const ciCompleto = estudianteRaw.ci
    ? `${estudianteRaw.ci} ${cleanText(estudianteRaw.expedicion)?.toUpperCase() ?? ''}`.trim()
    : null;

  return {
    id: raw.id ?? null,
    estudianteId: estudianteRaw.id ?? raw.student_id ?? null,
    gestionId: gestionRaw.id ?? raw.management_id ?? null,
    profile: {
      nombreCompleto,
      codigoEstudiante: cleanText(estudianteRaw.codigoEstudiante),
      ciCompleto,
      carrera: cleanText(estudianteRaw.carrera ?? raw.carrera),
    },
    gestion: {
      id: gestionRaw.id ?? null,
      codigo: cleanText(gestionRaw.codigo),
      nombre: cleanText(gestionRaw.nombre),
      anio: gestionRaw.anio ?? null,
    },
    montoBase: toNumber(raw.monto_base ?? raw.baseAmount),
    descuentoBeca: toNumber(raw.descuento_beca ?? raw.scholarship_discount),
    montoObligatorio: toNumber(raw.monto_obligatorio ?? raw.mandatoryAmount),
    estado: cleanText(raw.estado ?? raw.state),
  };
}

/**
 * Combina la cabecera (GET /:id) con el estado del aporte (estado-registro) en el
 * DTO final de la ficha: añade total pagado, saldo, cantidad de pagos y `cuotas`.
 *
 * @param {Object|null} detail - Salida de `mapPagoDetailFromApi`.
 * @param {Object|null} estado - Objeto `data` de `obtenerEstadoRegistro`.
 * @returns {Object|null}
 */
export function mergePagoDetail(detail, estado) {
  if (!detail) return null;

  const cuotas = Array.isArray(estado?.cuotas) ? estado.cuotas.map(mapCuota).filter(Boolean) : [];

  return {
    ...detail,
    totalPagado: toNumber(estado?.total_pagado),
    saldoPendiente: toNumber(estado?.saldo_pendiente),
    cantidadPagos: estado?.cantidad_pagos != null ? toNumber(estado.cantidad_pagos) : cuotas.length,
    cuotas,
  };
}
