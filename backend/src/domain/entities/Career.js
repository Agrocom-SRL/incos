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
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('trainingArea')) {
      this.trainingArea = data.trainingArea;
    }
    if (data.hasOwnProperty('grantedTitle')) {
      this.grantedTitle = data.grantedTitle;
    }
    if (data.hasOwnProperty('colorHex')) {
      this.colorHex = data.colorHex;
    }
    if (data.hasOwnProperty('imagePath')) {
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
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('trainingArea')) {
      plainObject.trainingArea = this.trainingArea;
    }
    if (this.hasOwnProperty('grantedTitle')) {
      plainObject.grantedTitle = this.grantedTitle;
    }
    if (this.hasOwnProperty('colorHex')) {
      plainObject.colorHex = this.colorHex;
    }
    if (this.hasOwnProperty('imagePath')) {
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
