import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: PaymentMethod
 * Representa un método de pago disponible
 */
export class PaymentMethod extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      this.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
