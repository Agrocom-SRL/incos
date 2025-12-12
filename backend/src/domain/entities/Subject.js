import { BaseEntity } from './BaseEntity.js';
import { TIPOS_MATERIA_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: Subject
 * Representa una materia/curso
 */
export class Subject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.code = data.code || null;
    this.name = data.name || null;
    this.shortName = data.shortName || null;
    this.description = data.description || null;
    this.theoreticalHours = data.theoreticalHours !== undefined ? data.theoreticalHours : 0;
    this.practicalHours = data.practicalHours !== undefined ? data.practicalHours : 0;
    this.credits = data.credits || null;
    this.type = data.type || 'TEORICA_PRACTICA'; // TEORICA, PRACTICA, TEORICA_PRACTICA
    this.knowledgeArea = data.knowledgeArea || null;
  }

  /**
   * Calcula el total de horas
   * @returns {number}
   */
  getTotalHours() {
    return this.theoreticalHours + this.practicalHours;
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
   * Valida que las horas sean no negativas
   * @returns {boolean}
   */
  isValidHours() {
    return this.theoreticalHours >= 0 && this.practicalHours >= 0;
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
      shortName: this.shortName,
      description: this.description,
      theoreticalHours: this.theoreticalHours,
      practicalHours: this.practicalHours,
      credits: this.credits,
      type: this.type,
      knowledgeArea: this.knowledgeArea,
    };
  }
}
