import { BaseEntity } from './BaseEntity.js';
import { TIPOS_MATERIA_VALUES, TIPOS_MATERIA } from '../constants/index.js';

/**
 * Entidad de Dominio: Subject
 * Representa una materia/asignatura
 */
export class Subject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'acronym')) {
      this.acronym = data.acronym;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'objectives')) {
      this.objectives = data.objectives;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'classification')) {
      this.classification = data.classification;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'type')) {
      this.type = data.type;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'acronym')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.type = TIPOS_MATERIA.TEORICA_PRACTICA;
    }
  }

  /**
   * Valida el tipo de materia
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return false;
    return TIPOS_MATERIA_VALUES.includes(this.type);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'acronym')) {
      plainObject.acronym = this.acronym;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'objectives')) {
      plainObject.objectives = this.objectives;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'classification')) {
      plainObject.classification = this.classification;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'type')) {
      plainObject.type = this.type;
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
