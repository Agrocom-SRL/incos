/**
 * Mapper: configuración de pagos (API → DTO UI, módulo Finanzas).
 *
 * Normaliza las 4 entidades que componen la pantalla "Config. de pagos":
 *   - configuracionAporte (configuracion_aportes) → aporte de la gestión vigente.
 *   - metodoPago         (metodos_pago)          → los 4 fijos.
 *   - bancoAutorizado    (bancos_autorizados)    → bancos.
 *   - cuentaPago         (cuentas_pago)          → cuentas + QR.
 *
 * Módulo independiente del legacy `@pagos`. `dataKey` (front) coincide con el
 * `dataFieldName` (back): configuracionAporte / metodoPago / bancoAutorizado / cuentaPago.
 */

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const toBool = (value, fallback = false) => (value == null ? fallback : value === true || value === 1 || value === '1');

/** Orden canónico de los 4 métodos fijos. */
export const METODOS_ORDEN = ['EFECTIVO', 'QR', 'TRANSFERENCIA', 'DEPOSITO'];

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

/**
 * Mapea un método de pago (item de `metodosPago`).
 * Entidad backend: { id, code, name, active }.
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
    activo: toBool(raw.active ?? raw.activo, true),
  };
};

/** Ordena los métodos según `METODOS_ORDEN` (los 4 fijos). */
export const ordenarMetodos = (metodos = []) =>
  [...metodos].sort((a, b) => {
    const ia = METODOS_ORDEN.indexOf(a.codigo);
    const ib = METODOS_ORDEN.indexOf(b.codigo);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

/**
 * Mapea un banco autorizado (item de `bancosAutorizados`).
 * Entidad backend: { id, paymentMethodId, code, name, active }.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapBancoAutorizado = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    metodoPagoId: raw.paymentMethodId ?? raw.metodoPagoId ?? raw.metodo_pago_id ?? null,
    codigo: cleanText(raw.code ?? raw.codigo),
    nombre: cleanText(raw.name ?? raw.nombre),
    activo: toBool(raw.active ?? raw.activo, true),
  };
};

/**
 * Mapea una cuenta de pago (item de `cuentasPago`), resolviendo el nombre del banco.
 * Entidad backend: { id, paymentMethodId, bankId, accountHolderName, accountNumber,
 *   phoneNumber, qrImageUrl, active }.
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

  return {
    id: raw.id,
    metodoPagoId: raw.paymentMethodId ?? raw.metodoPagoId ?? raw.metodo_pago_id ?? null,
    bancoId,
    bancoNombre,
    nombreTitular: cleanText(raw.accountHolderName ?? raw.nombreTitular ?? raw.nombre_titular),
    numeroCuenta: cleanText(raw.accountNumber ?? raw.numeroCuenta ?? raw.numero_cuenta),
    numeroCelular: cleanText(raw.phoneNumber ?? raw.numeroCelular ?? raw.numero_celular),
    qrImagenUrl: cleanText(raw.qrImageUrl ?? raw.qrImagenUrl ?? raw.qr_imagen_url),
    activo: toBool(raw.active ?? raw.activo, true),
  };
};

/** Construye un índice { [bancoId]: banco } para resolver el nombre del banco en cuentas. */
export const indexarBancos = (bancos = []) =>
  bancos.reduce((acc, banco) => {
    if (banco?.id != null) acc[banco.id] = banco;
    return acc;
  }, {});
