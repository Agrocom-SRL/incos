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
    if (data.hasOwnProperty('studentId')) {
      this.studentId = data.studentId;
    }
    if (data.hasOwnProperty('disabilityTypeId')) {
      this.disabilityTypeId = data.disabilityTypeId;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('disabilityDegree')) {
      this.disabilityDegree = data.disabilityDegree; // LEVE, MODERADO, SEVERO, PROFUNDO
    }
    if (data.hasOwnProperty('cause')) {
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
    if (this.hasOwnProperty('studentId')) {
      plainObject.studentId = this.studentId;
    }
    if (this.hasOwnProperty('disabilityTypeId')) {
      plainObject.disabilityTypeId = this.disabilityTypeId;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('disabilityDegree')) {
      plainObject.disabilityDegree = this.disabilityDegree;
    }
    if (this.hasOwnProperty('cause')) {
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

