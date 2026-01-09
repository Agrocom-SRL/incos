import { BaseEntity } from './BaseEntity.js';
import { ESTADOS_CURSOS_VALUES, ESTADOS_CURSOS } from '../constants/index.js';

/**
 * Entidad de Dominio: Course
 * Representa un curso/paralelo/grupo de una materia
 */
export class Course extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.subjectId = data.subjectId || null;
    this.name = data.name || null;
    this.code = data.code || null;
    this.maxCapacity = data.maxCapacity !== undefined ? data.maxCapacity : 35;
    this.minCapacity = data.minCapacity !== undefined ? data.minCapacity : 10;
    this.state = data.state || ESTADOS_CURSOS.PROPUESTO;
    this.description = data.description || null;
  }

  /**
   * Valida el estado del curso
   * @returns {boolean}
   */
  isValidState() {
    if (!this.state) return false;
    return ESTADOS_CURSOS_VALUES.includes(this.state);
  }

  /**
   * Valida que la capacidad máxima sea mayor que la mínima
   * @returns {boolean}
   */
  isValidCapacity() {
    return this.maxCapacity > 0 && this.minCapacity > 0 && this.maxCapacity >= this.minCapacity;
  }

  /**
   * Verifica si el curso está aprobado
   * @returns {boolean}
   */
  isApproved() {
    return this.state === ESTADOS_CURSOS.APROBADO;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      subjectId: this.subjectId,
      name: this.name,
      code: this.code,
      maxCapacity: this.maxCapacity,
      minCapacity: this.minCapacity,
      state: this.state,
      description: this.description,
    };
  }
}
