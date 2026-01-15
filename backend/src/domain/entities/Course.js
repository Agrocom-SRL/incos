import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Course
 * Representa un curso (materia) de cada paralelo
 * Es la intersección entre un paralelo y las asignaturas del plan de estudios
 */
export class Course extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('parallelId')) {
      this.parallelId = data.parallelId;
    }
    if (data.hasOwnProperty('planSubjectId')) {
      this.planSubjectId = data.planSubjectId;
    }
    if (data.hasOwnProperty('maxCapacity')) {
      this.maxCapacity = data.maxCapacity;
    } else if (!data.hasOwnProperty('code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.maxCapacity = 35;
    }
    if (data.hasOwnProperty('minCapacity')) {
      this.minCapacity = data.minCapacity;
    } else if (!data.hasOwnProperty('code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.minCapacity = 10;
    }
    if (data.hasOwnProperty('colorHex')) {
      this.colorHex = data.colorHex;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('parallelId')) {
      plainObject.parallelId = this.parallelId;
    }
    if (this.hasOwnProperty('planSubjectId')) {
      plainObject.planSubjectId = this.planSubjectId;
    }
    if (this.hasOwnProperty('maxCapacity')) {
      plainObject.maxCapacity = this.maxCapacity;
    }
    if (this.hasOwnProperty('minCapacity')) {
      plainObject.minCapacity = this.minCapacity;
    }
    if (this.hasOwnProperty('colorHex')) {
      plainObject.colorHex = this.colorHex;
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
