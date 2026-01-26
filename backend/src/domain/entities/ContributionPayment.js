import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: ContributionPayment
 * Representa un pago del aporte académico
 * IMPORTANTE: El pago se realiza ANTES de la inscripción
 */
export class ContributionPayment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('enrollmentId')) {
      this.enrollmentId = data.enrollmentId;
    }
    if (data.hasOwnProperty('studentScholarshipId')) {
      this.studentScholarshipId = data.studentScholarshipId;
    }
    if (data.hasOwnProperty('paymentMethodId')) {
      this.paymentMethodId = data.paymentMethodId;
    }
    if (data.hasOwnProperty('paymentAccountId')) {
      this.paymentAccountId = data.paymentAccountId;
    }
    if (data.hasOwnProperty('receiptNumber')) {
      this.receiptNumber = data.receiptNumber;
    }
    if (data.hasOwnProperty('paymentDate')) {
      this.paymentDate = data.paymentDate;
    }
    if (data.hasOwnProperty('totalAmount')) {
      this.totalAmount = parseFloat(data.totalAmount) || 0;
    }
    if (data.hasOwnProperty('scholarshipDiscount')) {
      this.scholarshipDiscount = parseFloat(data.scholarshipDiscount) || 0;
    }
    if (data.hasOwnProperty('amountPaid')) {
      this.amountPaid = parseFloat(data.amountPaid) || 0;
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

  /**
   * Calcula el monto pagado (monto_total - descuento_beca)
   * @returns {number}
   */
  calculateAmountPaid() {
    return (this.totalAmount || 0) - (this.scholarshipDiscount || 0);
  }

  /**
   * Verifica si el pago está completo
   * @returns {boolean}
   */
  isPaymentComplete() {
    const calculatedAmount = this.calculateAmountPaid();
    return this.amountPaid >= calculatedAmount;
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (this.hasOwnProperty('enrollmentId')) {
      plainObject.enrollmentId = this.enrollmentId;
    }
    if (this.hasOwnProperty('studentScholarshipId')) {
      plainObject.studentScholarshipId = this.studentScholarshipId;
    }
    if (this.hasOwnProperty('paymentMethodId')) {
      plainObject.paymentMethodId = this.paymentMethodId;
    }
    if (this.hasOwnProperty('paymentAccountId')) {
      plainObject.paymentAccountId = this.paymentAccountId;
    }
    if (this.hasOwnProperty('receiptNumber')) {
      plainObject.receiptNumber = this.receiptNumber;
    }
    if (this.hasOwnProperty('paymentDate')) {
      plainObject.paymentDate = this.paymentDate;
    }
    if (this.hasOwnProperty('totalAmount')) {
      plainObject.totalAmount = this.totalAmount;
    }
    if (this.hasOwnProperty('scholarshipDiscount')) {
      plainObject.scholarshipDiscount = this.scholarshipDiscount;
    }
    if (this.hasOwnProperty('amountPaid')) {
      plainObject.amountPaid = this.amountPaid;
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
