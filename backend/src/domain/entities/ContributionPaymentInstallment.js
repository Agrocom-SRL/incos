import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: ContributionPaymentInstallment
 * Representa una cuota (pago) contra una cabecera de aporte (pago_cuotas).
 * Cada registro es un abono con numeroRecibo, fechaPago, monto, metodoPagoId, etc.
 */
export class ContributionPaymentInstallment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('contributionPaymentId')) {
      this.contributionPaymentId = data.contributionPaymentId;
    }
    if (data.hasOwnProperty('receiptNumber')) {
      this.receiptNumber = data.receiptNumber;
    }
    if (data.hasOwnProperty('paymentDate')) {
      this.paymentDate = data.paymentDate;
    }
    if (data.hasOwnProperty('amount')) {
      this.amount = parseFloat(data.amount) ?? 0;
    }
    if (data.hasOwnProperty('paymentMethodId')) {
      this.paymentMethodId = data.paymentMethodId;
    }
    if (data.hasOwnProperty('paymentAccountId')) {
      this.paymentAccountId = data.paymentAccountId;
    }
    if (data.hasOwnProperty('transactionNumber')) {
      this.transactionNumber = data.transactionNumber;
    }
    if (data.hasOwnProperty('comprobanteCode')) {
      this.comprobanteCode = data.comprobanteCode;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('contributionPaymentId')) {
      plainObject.contributionPaymentId = this.contributionPaymentId;
    }
    if (this.hasOwnProperty('receiptNumber')) {
      plainObject.receiptNumber = this.receiptNumber;
    }
    if (this.hasOwnProperty('paymentDate')) {
      plainObject.paymentDate = this.paymentDate;
    }
    if (this.hasOwnProperty('amount')) {
      plainObject.amount = this.amount;
    }
    if (this.hasOwnProperty('paymentMethodId')) {
      plainObject.paymentMethodId = this.paymentMethodId;
    }
    if (this.hasOwnProperty('paymentAccountId')) {
      plainObject.paymentAccountId = this.paymentAccountId;
    }
    if (this.hasOwnProperty('transactionNumber')) {
      plainObject.transactionNumber = this.transactionNumber;
    }
    if (this.hasOwnProperty('comprobanteCode')) {
      plainObject.comprobanteCode = this.comprobanteCode;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
