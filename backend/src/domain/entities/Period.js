import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Period
 * Representa un periodo académico (semestre, trimestre, etc.)
 */
export class Period extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.careerId = data.careerId || null;
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
      careerId: this.careerId,
      name: this.name,
      number: this.number,
      displayOrder: this.displayOrder,
      description: this.description,
    };
  }
}
