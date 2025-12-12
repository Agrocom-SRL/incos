import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudyPlan
 * Representa una materia en el plan de estudios de una carrera
 */
export class StudyPlan extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.careerId = data.careerId || null;
    this.periodId = data.periodId || null;
    this.subjectId = data.subjectId || null;
    this.displayOrder = data.displayOrder !== undefined ? data.displayOrder : 1;
  }

  /**
   * Valida que el orden de visualización sea positivo
   * @returns {boolean}
   */
  isValidDisplayOrder() {
    return this.displayOrder > 0;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      careerId: this.careerId,
      periodId: this.periodId,
      subjectId: this.subjectId,
      displayOrder: this.displayOrder,
    };
  }
}
