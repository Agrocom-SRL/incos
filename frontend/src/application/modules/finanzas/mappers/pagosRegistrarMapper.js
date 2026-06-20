/**
 * Mapper: registro de abono/pago de aporte (API → DTO, módulo Finanzas).
 *
 * Normaliza las tres lecturas que alimentan el formulario de registro:
 *   - buscar-estudiantes-registro  → estudiante candidato (texto libre / preliminar).
 *   - estado-registro              → estado del aporte (monto obligatorio, saldo, cuotas).
 *   - métodos / cuentas / bancos   → catálogos de pago.
 *
 * El módulo Finanzas es independiente del legacy `@pagos`. El nombre completo se
 * arma en orden canónico APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES vía `buildFullName`.
 */

import { buildFullName, buildCompleteCI } from '@application/utils/formatters';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/**
 * Mapea una fila de la búsqueda de estudiantes (DTO del backend ya en camelCase).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapEstudianteBusqueda = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  // El backend ya devuelve nombreCompleto, pero lo reconstruimos en orden canónico
  // (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES) para mantener una sola convención.
  const nombreCompleto = buildFullName(
    raw.nombres,
    raw.apellidoPaterno,
    raw.apellidoMaterno,
    raw.nombreCompleto || raw.codigoEstudiante || 'Sin nombre',
  );

  const aporte = raw.aporteRegistro || {};

  return {
    id: raw.id,
    nombreCompleto,
    codigoEstudiante: cleanText(raw.codigoEstudiante),
    ciCompleto: raw.ci ? buildCompleteCI(raw.ci, cleanText(raw.expedicion)?.toUpperCase()) : null,
    carreraNombre: cleanText(raw.carreraNombre),
    celular: cleanText(raw.celular ?? raw.telefonoFijo),
    emailPersonal: cleanText(raw.emailPersonal),
    aporte: {
      tieneCabecera: !!aporte.tieneCabeceraAporte,
      tieneSaldoPendiente: !!aporte.tieneSaldoPendiente,
      totalmenteCubierto: !!aporte.aporteTotalmenteCubierto,
      saldoPendienteTotal: toNumber(aporte.saldoPendienteTotal),
    },
  };
};

/**
 * Mapea una cuota ya pagada del estado del aporte (estado-registro.cuotas[]).
 * @param {Object} raw
 * @returns {Object|null}
 */
const mapCuotaEstado = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const metodoPago = raw.metodo_pago || null;
  return {
    id: raw.id ?? null,
    numeroRecibo: cleanText(raw.numero_recibo),
    fechaPago: raw.fecha_pago ?? null,
    monto: toNumber(raw.monto),
    metodoNombre: metodoPago ? cleanText(metodoPago.nombre) || cleanText(metodoPago.codigo) : null,
  };
};

/**
 * Normaliza el estado del aporte (GET /pagos-aportes/estado-registro).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapEstadoAporte = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const gestionRaw = raw.gestion || {};
  const cabeceraRaw = raw.cabecera || null;

  return {
    cabeceraId: cabeceraRaw?.id ?? null,
    montoBase: toNumber(raw.monto_base),
    descuentoBeca: toNumber(raw.descuento_beca),
    montoObligatorio: toNumber(raw.monto_obligatorio),
    totalPagado: toNumber(raw.total_pagado),
    saldoPendiente: toNumber(raw.saldo_pendiente),
    cantidadPagos: toNumber(raw.cantidad_pagos),
    tieneDescuentoAplicado: !!raw.tiene_descuento_aplicado,
    gestion: {
      id: gestionRaw.id ?? null,
      nombre: cleanText(gestionRaw.nombre),
      anio: gestionRaw.anio ?? null,
    },
    cuotas: Array.isArray(raw.cuotas) ? raw.cuotas.map(mapCuotaEstado).filter(Boolean) : [],
  };
};

/** Códigos de método de pago según el backend (1=EFECTIVO, 2=QR, 3=TRANSFERENCIA, 4=DEPOSITO). */
export const METODO_CODIGO = {
  EFECTIVO: 'EFECTIVO',
  QR: 'QR',
  TRANSFERENCIA: 'TRANSFERENCIA',
  DEPOSITO: 'DEPOSITO',
};

/**
 * Mapea un método de pago del catálogo (GET /metodos-pago).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapMetodoPago = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const codigo = (cleanText(raw.code ?? raw.codigo) || '').toUpperCase();
  return {
    id: raw.id,
    codigo,
    nombre: cleanText(raw.name ?? raw.nombre) || codigo,
  };
};

/**
 * Mapea un banco autorizado del catálogo (GET /bancos-autorizados).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapBancoAutorizado = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    nombre: cleanText(raw.name ?? raw.nombre),
    codigo: cleanText(raw.code ?? raw.codigo),
  };
};

/**
 * Mapea una cuenta de pago (GET /cuentas-pago), resolviendo el nombre del banco.
 * @param {Object} raw
 * @param {Object} bancosMap - { [bancoId]: { nombre, codigo } }
 * @returns {Object|null}
 */
export const mapCuentaPago = (raw, bancosMap = {}) => {
  if (!raw || typeof raw !== 'object') return null;

  const bancoId = raw.bankId ?? raw.bancoId ?? raw.banco_id ?? null;
  const bancoNombre =
    cleanText(raw.banco?.nombre ?? raw.bancoNombre) ||
    (bancoId != null ? cleanText(bancosMap[bancoId]?.nombre) : null);

  const nombreTitular = cleanText(raw.accountHolderName ?? raw.nombreTitular ?? raw.nombre);
  const numeroCuenta = cleanText(raw.accountNumber ?? raw.numeroCuenta);

  const partes = [nombreTitular, numeroCuenta, bancoNombre].filter(Boolean);

  return {
    id: raw.id,
    nombreTitular,
    numeroCuenta,
    bancoNombre,
    label: partes.length ? partes.join(' · ') : `Cuenta ${raw.id}`,
  };
};
