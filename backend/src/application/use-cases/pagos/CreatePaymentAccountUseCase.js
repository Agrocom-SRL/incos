import { ValidationError } from '../../../domain/errors/AppError.js';
import { UPLOAD } from '../../../infrastructure/config/uploads.config.js';

/**
 * Use Case: CreatePaymentAccountUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Crea una cuenta de pago (metodoPagoId, bancoId, nombreTitular, numeroCuenta,
 * numeroCelular, qrImagenUrl). La imagen QR es opcional:
 * - Si llega un archivo (req.file vía multipart), se guarda y la ruta pública
 *   resultante se persiste en qrImagenUrl.
 * - Si no hay archivo, se respeta el qrImagenUrl enviado en el body o null.
 */
export class CreatePaymentAccountUseCase {
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
   * @param {Object} params.body
   * @param {Object|null} [params.qrFile] - Archivo multer (req.file) opcional
   * @param {number|null} [params.userId]
   * @returns {Promise<Object>} cuenta creada (entidad)
   */
  async execute({ body = {}, qrFile = null, userId = null }) {
    const nombreTitular = body.nombre_titular ?? body.nombreTitular ?? body.accountHolderName;
    if (!nombreTitular || String(nombreTitular).trim() === '') {
      throw new ValidationError('nombre_titular es requerido');
    }

    const metodoPagoId = body.metodo_pago_id ?? body.metodoPagoId ?? body.paymentMethodId ?? null;
    const bancoId = body.banco_id ?? body.bancoId ?? body.bankId ?? null;
    const numeroCuenta = body.numero_cuenta ?? body.numeroCuenta ?? body.accountNumber ?? null;
    const numeroCelular = body.numero_celular ?? body.numeroCelular ?? body.phoneNumber ?? null;

    const qrImageUrl = this._resolveQrUrl(qrFile, body);

    const created = await this.paymentAccountRepository.create(
      {
        paymentMethodId: metodoPagoId != null && metodoPagoId !== '' ? Number(metodoPagoId) : null,
        bankId: bancoId != null && bancoId !== '' ? Number(bancoId) : null,
        accountHolderName: String(nombreTitular).trim(),
        accountNumber: numeroCuenta || null,
        phoneNumber: numeroCelular || null,
        qrImageUrl: qrImageUrl || null,
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger?.info?.('[Pagos] Cuenta de pago creada', { id: created.id, qr: !!qrImageUrl });
    return created;
  }

  /**
   * Resuelve la URL del QR: si hay archivo subido, devuelve su ruta pública;
   * si no, respeta el qrImagenUrl enviado (o null).
   * @private
   */
  _resolveQrUrl(qrFile, body) {
    if (qrFile?.filename) {
      return UPLOAD.cuentaPagoQrPublicPath(qrFile.filename);
    }
    return body.qr_imagen_url ?? body.qrImagenUrl ?? body.qrImageUrl ?? null;
  }
}
