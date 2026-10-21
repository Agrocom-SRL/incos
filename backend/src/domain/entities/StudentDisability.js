import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudentDisability
 * Representa una discapacidad de un estudiante
 */
export class StudentDisability extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'studentId')) {
      this.studentId = data.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'disabilityTypeId')) {
      this.disabilityTypeId = data.disabilityTypeId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'disabilityDegree')) {
      this.disabilityDegree = data.disabilityDegree; // LEVE, MODERADO, SEVERO, PROFUNDO
    }
    if (Object.prototype.hasOwnProperty.call(data, 'cause')) {
      this.cause = data.cause;
    }
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'disabilityTypeId')) {
      plainObject.disabilityTypeId = this.disabilityTypeId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'disabilityDegree')) {
      plainObject.disabilityDegree = this.disabilityDegree;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'cause')) {
      plainObject.cause = this.cause;
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
