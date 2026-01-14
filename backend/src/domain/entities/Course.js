import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Course
 * Representa un curso (materia) de cada paralelo
 * Es la intersección entre un paralelo y las asignaturas del plan de estudios
 */
export class Course extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null;
    this.parallelId = data.parallelId || null;
    this.planSubjectId = data.planSubjectId || null;
    this.maxCapacity = data.maxCapacity !== undefined ? data.maxCapacity : 35;
    this.minCapacity = data.minCapacity !== undefined ? data.minCapacity : 10;
    this.colorHex = data.colorHex || null;
  }

  /**
   * Valida que la capacidad máxima sea mayor que la mínima
   * @returns {boolean}
   */
  isValidCapacity() {
    return this.maxCapacity > 0 && this.minCapacity >= 0 && this.maxCapacity >= this.minCapacity;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      code: this.code,
      parallelId: this.parallelId,
      planSubjectId: this.planSubjectId,
      maxCapacity: this.maxCapacity,
      minCapacity: this.minCapacity,
      colorHex: this.colorHex,
    };
  }
}
