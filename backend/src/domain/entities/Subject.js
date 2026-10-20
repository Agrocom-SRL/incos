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
    if (data.hasOwnProperty('acronym')) {
      this.acronym = data.acronym;
    }
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('objectives')) {
      this.objectives = data.objectives;
    }
    if (data.hasOwnProperty('classification')) {
      this.classification = data.classification;
    }
    if (data.hasOwnProperty('type')) {
      this.type = data.type;
    } else if (!data.hasOwnProperty('acronym')) {
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
    if (this.hasOwnProperty('acronym')) {
      plainObject.acronym = this.acronym;
    }
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('objectives')) {
      plainObject.objectives = this.objectives;
    }
    if (this.hasOwnProperty('classification')) {
      plainObject.classification = this.classification;
    }
    if (this.hasOwnProperty('type')) {
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
