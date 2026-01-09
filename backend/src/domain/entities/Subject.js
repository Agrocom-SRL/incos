import { BaseEntity } from './BaseEntity.js';
import { TIPOS_MATERIA_VALUES, TIPOS_MATERIA } from '../constants/index.js';

/**
 * Entidad de Dominio: Subject
 * Representa una materia/asignatura
 */
export class Subject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.acronym = data.acronym || null;
    this.name = data.name || null;
    this.objectives = data.objectives || null;
    this.classification = data.classification || null;
    this.type = data.type || TIPOS_MATERIA.TEORICA_PRACTICA;
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      acronym: this.acronym,
      name: this.name,
      objectives: this.objectives,
      classification: this.classification,
      type: this.type,
    };
  }
}
