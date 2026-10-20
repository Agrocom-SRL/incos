import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';
import { parseBooleano, parseIdOpcional } from '../../utils/validacionEntrada.js';

/**
 * Use Case: UpdatePaymentAccountUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Edita una cuenta de pago: metodoPagoId, bancoId, nombreTitular, numeroCuenta,
 * numeroCelular, qrImagenUrl y/o estado activo. El "eliminar" se hace togglando
 * `activo` por PUT (no hay borrado físico). La imagen QR es opcional:
 * - Si llega archivo nuevo (req.file), reemplaza qrImagenUrl con su ruta pública.
 * - Si no hay archivo pero se envía qr_imagen_url, se respeta ese valor (o null).
 * - Si no se envía nada relacionado al QR, no se toca el valor existente.
 */
export class UpdatePaymentAccountUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.paymentAccountRepository - Repositorio de cuentas de pago
   * @param {Object} params.logger
   */
  constructor({ paymentAccountRepository, logger }) {
    this.paymentAccountRepository = paymentAccountRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|string} params.id
   * @param {Object} params.body
   * @param {Object|null} [params.qrFile] - Archivo multer (req.file) opcional
   * @param {number|null} [params.userId]
   * @returns {Promise<Object>} cuenta actualizada (entidad)
   */
  async execute({ id, body = {}, qrFile = null, userId = null }) {
    const accountId = this._parseId(id);

    const existing = await this.paymentAccountRepository.findById(accountId);
    if (!existing) {
      throw new NotFoundError(`Cuenta de pago con ID ${accountId}`);
    }

    const payload = {};

    const nombreTitular = body.nombre_titular ?? body.nombreTitular ?? body.accountHolderName;
    if (nombreTitular !== undefined) {
      const trimmed = String(nombreTitular).trim();
      if (trimmed === '') {
        throw new ValidationError('nombre_titular no puede ser vacío');
      }
      payload.accountHolderName = trimmed;
    }

    const metodoPagoId = body.metodo_pago_id ?? body.metodoPagoId ?? body.paymentMethodId;
    if (metodoPagoId !== undefined) {
      payload.paymentMethodId = parseIdOpcional(metodoPagoId, 'metodo_pago_id');
    }

    const bancoId = body.banco_id ?? body.bancoId ?? body.bankId;
    if (bancoId !== undefined) {
      payload.bankId = parseIdOpcional(bancoId, 'banco_id');
    }

    const numeroCuenta = body.numero_cuenta ?? body.numeroCuenta ?? body.accountNumber;
    if (numeroCuenta !== undefined) {
      payload.accountNumber = numeroCuenta || null;
    }

    const numeroCelular = body.numero_celular ?? body.numeroCelular ?? body.phoneNumber;
    if (numeroCelular !== undefined) {
      payload.phoneNumber = numeroCelular || null;
    }

    const qrImageUrl = this._resolveQrUrl(qrFile, body);
    if (qrImageUrl !== undefined) {
      payload.qrImageUrl = qrImageUrl || null;
    }

    const activo = body.activo ?? body.active;
    if (activo !== undefined) {
      payload.active = parseBooleano(activo, 'activo');
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError('No se enviaron campos para actualizar');
    }

    const updated = await this.paymentAccountRepository.update(accountId, payload, userId);

    this.logger?.info?.('[Pagos] Cuenta de pago actualizada', {
      id: accountId,
      campos: Object.keys(payload),
    });

    return updated;
  }

  /**
   * Devuelve: ruta pública si hay archivo; el valor del body si se envió; o
   * `undefined` si no se tocó el QR (para no sobrescribir el existente).
   * @private
   */
  _resolveQrUrl(qrFile, body) {
    if (qrFile?.filename) {
      return UPLOAD.cuentaPagoQrPublicPath(qrFile.filename);
    }
    const bodyValue = body.qr_imagen_url ?? body.qrImagenUrl ?? body.qrImageUrl;
    if (bodyValue !== undefined) {
      return bodyValue;
    }
    return undefined;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('id de cuenta de pago inválido');
    }
    return id;
  }
}
