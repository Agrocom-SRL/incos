import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudentDisability
 * Representa una discapacidad de un estudiante
 */
export class StudentDisability extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studentId = data.studentId || null;
    this.disabilityTypeId = data.disabilityTypeId || null;
    this.description = data.description || null;
    this.disabilityDegree = data.disabilityDegree || null; // LEVE, MODERADO, SEVERO, PROFUNDO
    this.cause = data.cause || null;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studentId: this.studentId,
      disabilityTypeId: this.disabilityTypeId,
      description: this.description,
      disabilityDegree: this.disabilityDegree,
      cause: this.cause,
    };
  }
}

