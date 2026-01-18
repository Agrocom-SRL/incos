import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_PAGO_VALUES, ESTADOS_PAGO } from '../constants/payments.constants.js';

/**
 * Entidad de Dominio: Payment
 * Representa un pago de aporte voluntario de un estudiante
 */
export class Payment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('enrollmentId')) {
      this.enrollmentId = data.enrollmentId;
    }
    if (data.hasOwnProperty('managementId')) {
      this.managementId = data.managementId;
    }
    if (data.hasOwnProperty('receiptNumber')) {
      this.receiptNumber = data.receiptNumber;
    }
    if (data.hasOwnProperty('paymentDate')) {
      this.paymentDate = data.paymentDate;
    }
    if (data.hasOwnProperty('totalAmount')) {
      this.totalAmount = data.totalAmount;
    } else if (!data.hasOwnProperty('studentId')) {
      this.totalAmount = 400.00; // Aporte anualizado por defecto
    }
    if (data.hasOwnProperty('scholarshipDiscount')) {
      this.scholarshipDiscount = data.scholarshipDiscount;
    } else if (!data.hasOwnProperty('studentId')) {
      this.scholarshipDiscount = 0.00;
    }
    if (data.hasOwnProperty('otherDiscount')) {
      this.otherDiscount = data.otherDiscount;
    } else if (!data.hasOwnProperty('studentId')) {
      this.otherDiscount = 0.00;
    }
    if (data.hasOwnProperty('amountPaid')) {
      this.amountPaid = data.amountPaid;
    } else if (!data.hasOwnProperty('studentId')) {
      this.amountPaid = 0.00;
    }
    if (data.hasOwnProperty('paymentMethod')) {
      this.paymentMethod = data.paymentMethod;
    }
    if (data.hasOwnProperty('transactionNumber')) {
      this.transactionNumber = data.transactionNumber;
    }
    if (data.hasOwnProperty('bank')) {
      this.bank = data.bank;
    }
    if (data.hasOwnProperty('concept')) {
      this.concept = data.concept;
    }
    if (data.hasOwnProperty('paymentPeriod')) {
      this.paymentPeriod = data.paymentPeriod;
    }
    if (data.hasOwnProperty('state')) {
      this.state = data.state;
    } else if (!data.hasOwnProperty('studentId')) {
      this.state = ESTADOS_PAGO.PENDIENTE;
    }
    if (data.hasOwnProperty('dueDate')) {
      this.dueDate = data.dueDate;
    }
    if (data.hasOwnProperty('validated')) {
      this.validated = data.validated;
    } else if (!data.hasOwnProperty('studentId')) {
      this.validated = false;
    }
    if (data.hasOwnProperty('validatedBy')) {
      this.validatedBy = data.validatedBy;
    }
    if (data.hasOwnProperty('validationDate')) {
      this.validationDate = data.validationDate;
    }
    if (data.hasOwnProperty('receiptUrl')) {
      this.receiptUrl = data.receiptUrl;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
    if (data.hasOwnProperty('cancellationReason')) {
      this.cancellationReason = data.cancellationReason;
    }
  }

  /**
   * Valida el estado del pago
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_PAGO_VALUES.includes(this.state);
  }

  /**
   * Verifica si el pago está pagado
   * @returns {boolean}
   */
  isPaid() {
    return this.state === ESTADOS_PAGO.PAGADO;
  }

  /**
   * Verifica si el pago está pendiente
   * @returns {boolean}
   */
  isPending() {
    return this.state === ESTADOS_PAGO.PENDIENTE;
  }

  /**
   * Calcula el monto a pagar (total - descuentos)
   * @returns {number}
   */
  calculateAmountToPay() {
    const totalDiscount = (this.scholarshipDiscount || 0) + (this.otherDiscount || 0);
    return (this.totalAmount || 0) - totalDiscount;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('enrollmentId')) {
      plainObject.enrollmentId = this.enrollmentId;
    }
    if (this.hasOwnProperty('managementId')) {
      plainObject.managementId = this.managementId;
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
    if (this.hasOwnProperty('otherDiscount')) {
      plainObject.otherDiscount = this.otherDiscount;
    }
    if (this.hasOwnProperty('amountPaid')) {
      plainObject.amountPaid = this.amountPaid;
    }
    if (this.hasOwnProperty('paymentMethod')) {
      plainObject.paymentMethod = this.paymentMethod;
    }
    if (this.hasOwnProperty('transactionNumber')) {
      plainObject.transactionNumber = this.transactionNumber;
    }
    if (this.hasOwnProperty('bank')) {
      plainObject.bank = this.bank;
    }
    if (this.hasOwnProperty('concept')) {
      plainObject.concept = this.concept;
    }
    if (this.hasOwnProperty('paymentPeriod')) {
      plainObject.paymentPeriod = this.paymentPeriod;
    }
    if (this.hasOwnProperty('state')) {
      plainObject.state = this.state;
    }
    if (this.hasOwnProperty('dueDate')) {
      plainObject.dueDate = this.dueDate;
    }
    if (this.hasOwnProperty('validated')) {
      plainObject.validated = this.validated;
    }
    if (this.hasOwnProperty('validatedBy')) {
      plainObject.validatedBy = this.validatedBy;
    }
    if (this.hasOwnProperty('validationDate')) {
      plainObject.validationDate = this.validationDate;
    }
    if (this.hasOwnProperty('receiptUrl')) {
      plainObject.receiptUrl = this.receiptUrl;
    }
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
    }
    if (this.hasOwnProperty('cancellationReason')) {
      plainObject.cancellationReason = this.cancellationReason;
    }

    // Campos calculados
    plainObject.amountToPay = this.calculateAmountToPay();
    plainObject.totalDiscount = (this.scholarshipDiscount || 0) + (this.otherDiscount || 0);

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
