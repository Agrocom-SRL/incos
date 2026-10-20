import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: AuthorizedBank
 * Representa un banco autorizado para métodos TRANSFERENCIA y DEPOSITO
 */
export class AuthorizedBank extends BaseEntity {
  constructor(data = {}) {
    super(data);
    if (data.hasOwnProperty('paymentMethodId')) {
      this.paymentMethodId = data.paymentMethodId;
    }
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
  }

  toPlainObject() {
    const plainObject = super.toPlainObject();

    if (this.hasOwnProperty('paymentMethodId')) {
      plainObject.paymentMethodId = this.paymentMethodId;
    }
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
