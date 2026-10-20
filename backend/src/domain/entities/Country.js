import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Country
 * Representa un país
 */
export class Country extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isoCode')) {
      this.isoCode = data.isoCode;
    }
  }

  /**
   * Valida que el código ISO tenga 3 caracteres
   * @returns {boolean}
   */
  isValidIsoCode() {
    if (!this.isoCode) return false;
    return this.isoCode.length === 3 && /^[A-Z]{3}$/.test(this.isoCode);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'isoCode')) {
      plainObject.isoCode = this.isoCode;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
