import { BaseEntity } from './BaseEntity.js';
import { TIPOS_ACTIVIDAD_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Activity
 * Representa una actividad académica reutilizable entre gestiones
 */
export class Activity extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('name')) {
      this.name = data.name;
    }
    if (data.hasOwnProperty('description')) {
      this.description = data.description;
    }
    if (data.hasOwnProperty('type')) {
      this.type = data.type; // INSCRIPCION, PLANIFICACION, ACADEMICA, EVALUACION, ADMINISTRATIVA, FERIADO, EVENTO_INSTITUCIONAL, FERIA, MODALIDAD_GRADO, OTRO
    }
    if (data.hasOwnProperty('isHighlighted')) {
      this.isHighlighted = data.isHighlighted;
    } else if (!data.hasOwnProperty('name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isHighlighted = false;
    }
    if (data.hasOwnProperty('icon')) {
      this.icon = data.icon;
    }
  }

  /**
   * Valida el tipo de actividad
   * @returns {boolean}
   */
  isValidType() {
    if (!this.type) return true; // Opcional
    return TIPOS_ACTIVIDAD_VALUES.includes(this.type);
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();
    
    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('name')) {
      plainObject.name = this.name;
    }
    if (this.hasOwnProperty('description')) {
      plainObject.description = this.description;
    }
    if (this.hasOwnProperty('type')) {
      plainObject.type = this.type;
    }
    if (this.hasOwnProperty('isHighlighted')) {
      plainObject.isHighlighted = this.isHighlighted;
    }
    if (this.hasOwnProperty('icon')) {
      plainObject.icon = this.icon;
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
