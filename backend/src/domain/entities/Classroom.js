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
    if (data.hasOwnProperty('code')) {
      this.code = data.code;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('category')) {
      this.category = data.category;
    } else if (!data.hasOwnProperty('code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.category = CATEGORIAS_AULA.AULA;
    }
    if (data.hasOwnProperty('capacity')) {
      this.capacity = data.capacity;
    } else if (!data.hasOwnProperty('code')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.capacity = 35;
    }
    if (data.hasOwnProperty('observations')) {
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
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('category')) {
      plainObject.category = this.category;
    }
    if (this.hasOwnProperty('capacity')) {
      plainObject.capacity = this.capacity;
    }
    if (this.hasOwnProperty('observations')) {
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
