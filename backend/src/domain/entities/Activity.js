import { BaseEntity } from './BaseEntity.js';
import { TIPOS_ACTIVIDAD_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Activity
 * Representa una actividad académica reutilizable entre gestiones
 */
export class Activity extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.name = data.name || null;
    this.description = data.description || null;
    this.type = data.type || null; // INSCRIPCION, PLANIFICACION, ACADEMICA, EVALUACION, ADMINISTRATIVA, FERIADO, EVENTO_INSTITUCIONAL, FERIA, MODALIDAD_GRADO, OTRO
    this.isHighlighted = data.isHighlighted !== undefined ? data.isHighlighted : false;
    this.icon = data.icon || null;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      name: this.name,
      description: this.description,
      type: this.type,
      isHighlighted: this.isHighlighted,
      icon: this.icon,
    };
  }
}
