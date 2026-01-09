import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Period
 * Representa un periodo (año académico) de un plan de estudios
 * Ejemplo: 1º Año, 2º Año, 3º Año
 */
export class Period extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studyPlanId = data.studyPlanId || null;
    this.name = data.name || null;
    this.number = data.number || null;
    this.displayOrder = data.displayOrder !== undefined ? data.displayOrder : 1;
    this.description = data.description || null;
  }

  /**
   * Valida que el número del periodo sea positivo
   * @returns {boolean}
   */
  isValidNumber() {
    return this.number > 0;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studyPlanId: this.studyPlanId,
      name: this.name,
      number: this.number,
      displayOrder: this.displayOrder,
      description: this.description,
    };
  }
}
