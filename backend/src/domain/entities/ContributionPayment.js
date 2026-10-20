import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: ContributionPayment
 * Representa la cabecera del aporte académico por estudiante y gestión (pago_aporte).
 * Una sola cabecera por (estudiante, gestión). El estudiante paga en cuotas; cada cuota se registra en ContributionPaymentInstallment.
 */
export class ContributionPayment extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
      this.managementId = data.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'studentScholarshipId')) {
      this.studentScholarshipId = data.studentScholarshipId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'baseAmount')) {
      this.baseAmount = parseFloat(data.baseAmount) ?? 0;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'scholarshipDiscount')) {
      this.scholarshipDiscount = parseFloat(data.scholarshipDiscount) ?? 0;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'mandatoryAmount')) {
      this.mandatoryAmount = parseFloat(data.mandatoryAmount) ?? 0;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'state')) {
      this.state = data.state;
    }
  }

  /**
   * Monto a pagar = baseAmount - scholarshipDiscount (coincide con mandatoryAmount en cabecera).
   * @returns {number}
   */
  getAmountToPay() {
    return (this.baseAmount ?? 0) - (this.scholarshipDiscount ?? 0);
  }

  /**
   * Verifica si la deuda está cancelada (total pagado >= monto obligatorio).
   * @param {number} totalPaid - Suma de montos de cuotas pagadas
   * @returns {boolean}
   */
  isCanceled(totalPaid = 0) {
    return (totalPaid ?? 0) >= (this.mandatoryAmount ?? 0);
  }

  /**
   * Verifica si el estado es PENDIENTE.
   * @returns {boolean}
   */
  isPending() {
    return this.state === 'PENDIENTE';
  }

  /**
   * Verifica si el estado es CANCELADO.
   * @returns {boolean}
   */
  isStateCanceled() {
    return this.state === 'CANCELADO';
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (Object.prototype.hasOwnProperty.call(this, 'studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'studentScholarshipId')) {
      plainObject.studentScholarshipId = this.studentScholarshipId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'baseAmount')) {
      plainObject.baseAmount = this.baseAmount;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'scholarshipDiscount')) {
      plainObject.scholarshipDiscount = this.scholarshipDiscount;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'mandatoryAmount')) {
      plainObject.mandatoryAmount = this.mandatoryAmount;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'state')) {
      plainObject.state = this.state;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
