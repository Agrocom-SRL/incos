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
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      this.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'type')) {
      this.type = data.type; // INSCRIPCION, PLANIFICACION, ACADEMICA, EVALUACION, ADMINISTRATIVA, FERIADO, EVENTO_INSTITUCIONAL, FERIA, MODALIDAD_GRADO, OTRO
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isHighlighted')) {
      this.isHighlighted = data.isHighlighted;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'name')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.isHighlighted = false;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'icon')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'description')) {
      plainObject.description = this.description;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'type')) {
      plainObject.type = this.type;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'isHighlighted')) {
      plainObject.isHighlighted = this.isHighlighted;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'icon')) {
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
