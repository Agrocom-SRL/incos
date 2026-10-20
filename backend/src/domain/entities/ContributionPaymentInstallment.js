import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: ContributionPaymentInstallment
 * Representa una cuota (pago) contra una cabecera de aporte (pago_cuotas).
 * Cada registro es un abono con numeroRecibo, fechaPago, monto, metodoPagoId, etc.
 */
export class ContributionPaymentInstallment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'contributionPaymentId')) {
      this.contributionPaymentId = data.contributionPaymentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'receiptNumber')) {
      this.receiptNumber = data.receiptNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'paymentDate')) {
      this.paymentDate = data.paymentDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'amount')) {
      this.amount = parseFloat(data.amount) ?? 0;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'paymentMethodId')) {
      this.paymentMethodId = data.paymentMethodId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'paymentAccountId')) {
      this.paymentAccountId = data.paymentAccountId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'transactionNumber')) {
      this.transactionNumber = data.transactionNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'comprobanteCode')) {
      this.comprobanteCode = data.comprobanteCode;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (Object.prototype.hasOwnProperty.call(this, 'contributionPaymentId')) {
      plainObject.contributionPaymentId = this.contributionPaymentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'receiptNumber')) {
      plainObject.receiptNumber = this.receiptNumber;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'paymentDate')) {
      plainObject.paymentDate = this.paymentDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'amount')) {
      plainObject.amount = this.amount;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'paymentMethodId')) {
      plainObject.paymentMethodId = this.paymentMethodId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'paymentAccountId')) {
      plainObject.paymentAccountId = this.paymentAccountId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'transactionNumber')) {
      plainObject.transactionNumber = this.transactionNumber;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'comprobanteCode')) {
      plainObject.comprobanteCode = this.comprobanteCode;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
