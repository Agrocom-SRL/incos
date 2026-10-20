import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: PaymentAccount
 * Representa una cuenta configurada para recibir pagos (QR, TRANSFERENCIA, DEPOSITO, TIGO_MONEY)
 */
export class PaymentAccount extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'paymentMethodId')) {
      this.paymentMethodId = data.paymentMethodId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'bankId')) {
      this.bankId = data.bankId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'accountHolderName')) {
      this.accountHolderName = data.accountHolderName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'accountNumber')) {
      this.accountNumber = data.accountNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'phoneNumber')) {
      this.phoneNumber = data.phoneNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'qrImageUrl')) {
      this.qrImageUrl = data.qrImageUrl;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (Object.prototype.hasOwnProperty.call(this, 'paymentMethodId')) {
      plainObject.paymentMethodId = this.paymentMethodId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'bankId')) {
      plainObject.bankId = this.bankId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'accountHolderName')) {
      plainObject.accountHolderName = this.accountHolderName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'accountNumber')) {
      plainObject.accountNumber = this.accountNumber;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'phoneNumber')) {
      plainObject.phoneNumber = this.phoneNumber;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'qrImageUrl')) {
      plainObject.qrImageUrl = this.qrImageUrl;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
