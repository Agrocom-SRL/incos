import { BaseEntity } from './BaseEntity.js';
import { CATEGORIAS_AULA_VALUES, CATEGORIAS_AULA } from '../constants/cursos.constants.js';

/**
 * Entidad de Dominio: Classroom
 * Representa aulas, laboratorios y espacios físicos del instituto
 */
export class Classroom extends BaseEntity {
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
    if (Object.prototype.hasOwnProperty.call(data, 'category')) {
      this.category = data.category;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.category = CATEGORIAS_AULA.AULA;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'capacity')) {
      this.capacity = data.capacity;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.capacity = 35;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
      this.observations = data.observations;
    }
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
    if (Object.prototype.hasOwnProperty.call(this, 'category')) {
      plainObject.category = this.category;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'capacity')) {
      plainObject.capacity = this.capacity;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'observations')) {
      plainObject.observations = this.observations;
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
