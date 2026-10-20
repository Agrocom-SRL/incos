import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: PaymentAccount
 * Representa una cuenta configurada para recibir pagos (QR, TRANSFERENCIA, DEPOSITO, TIGO_MONEY)
 */
export class PaymentAccount extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('paymentMethodId')) {
      this.paymentMethodId = data.paymentMethodId;
    }
    if (data.hasOwnProperty('bankId')) {
      this.bankId = data.bankId;
    }
    if (data.hasOwnProperty('accountHolderName')) {
      this.accountHolderName = data.accountHolderName;
    }
    if (data.hasOwnProperty('accountNumber')) {
      this.accountNumber = data.accountNumber;
    }
    if (data.hasOwnProperty('phoneNumber')) {
      this.phoneNumber = data.phoneNumber;
    }
    if (data.hasOwnProperty('qrImageUrl')) {
      this.qrImageUrl = data.qrImageUrl;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('paymentMethodId')) {
      plainObject.paymentMethodId = this.paymentMethodId;
    }
    if (this.hasOwnProperty('bankId')) {
      plainObject.bankId = this.bankId;
    }
    if (this.hasOwnProperty('accountHolderName')) {
      plainObject.accountHolderName = this.accountHolderName;
    }
    if (this.hasOwnProperty('accountNumber')) {
      plainObject.accountNumber = this.accountNumber;
    }
    if (this.hasOwnProperty('phoneNumber')) {
      plainObject.phoneNumber = this.phoneNumber;
    }
    if (this.hasOwnProperty('qrImageUrl')) {
      plainObject.qrImageUrl = this.qrImageUrl;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
