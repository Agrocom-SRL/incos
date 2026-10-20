import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Career
 * Representa una carrera académica
 */
export class Career extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      this.code = data.code;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'trainingArea')) {
      this.trainingArea = data.trainingArea;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'grantedTitle')) {
      this.grantedTitle = data.grantedTitle;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'colorHex')) {
      this.colorHex = data.colorHex;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'imagePath')) {
      this.imagePath = data.imagePath;
    }
  }

  /**
   * Valida el formato del color hexadecimal
   * @returns {boolean}
   */
  isValidColorHex() {
    if (!this.colorHex) return true; // Opcional
    return /^#[0-9A-F]{6}$/i.test(this.colorHex);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'trainingArea')) {
      plainObject.trainingArea = this.trainingArea;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'grantedTitle')) {
      plainObject.grantedTitle = this.grantedTitle;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'colorHex')) {
      plainObject.colorHex = this.colorHex;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'imagePath')) {
      plainObject.imagePath = this.imagePath;
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
