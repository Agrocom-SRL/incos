import { BaseEntity } from './BaseEntity.js';
import { CATEGORIAS_AULA_VALUES, CATEGORIAS_AULA } from '../constants/cursos.constants.js';

/**
 * Entidad de Dominio: Classroom
 * Representa aulas, laboratorios y espacios físicos del instituto
 */
export class Classroom extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null;
    this.name = data.name || null;
    this.category = data.category || CATEGORIAS_AULA.AULA;
    this.capacity = data.capacity !== undefined ? data.capacity : 35;
    this.observations = data.observations || null;
  }

  /**
   * Valida la categoría del aula
   * @returns {boolean}
   */
  isValidCategory() {
    if (!this.category) return false;
    return CATEGORIAS_AULA_VALUES.includes(this.category);
  }

  /**
   * Valida que la capacidad sea positiva
   * @returns {boolean}
   */
  isValidCapacity() {
    return this.capacity > 0;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      code: this.code,
      name: this.name,
      category: this.category,
      capacity: this.capacity,
      observations: this.observations,
    };
  }
}
