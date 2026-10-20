import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: PaymentMethod
 * Representa un método de pago disponible
 */
export class PaymentMethod extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }

    return plainObject;
  }

  toJSON() {
    return this.toPlainObject();
  }
}
