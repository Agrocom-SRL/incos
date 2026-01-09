import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: PlanSubject
 * Representa la asignación de una materia a un periodo en un plan de estudios
 */
export class PlanSubject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studyPlanId = data.studyPlanId || null;
    this.periodId = data.periodId || null;
    this.subjectId = data.subjectId || null;
    this.weeklyHours = data.weeklyHours || null;
    this.credits = data.credits || null;
    this.modality = data.modality || 'REGULAR'; // TRONCAL, ELECTIVA, REGULAR
    this.displayOrder = data.displayOrder !== undefined ? data.displayOrder : 1;
  }

  /**
   * Valida que las horas semanales sean positivas
   * @returns {boolean}
   */
  isValidWeeklyHours() {
    return this.weeklyHours > 0;
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
      studyPlanId: this.studyPlanId,
      periodId: this.periodId,
      subjectId: this.subjectId,
      weeklyHours: this.weeklyHours,
      credits: this.credits,
      modality: this.modality,
      displayOrder: this.displayOrder,
    };
  }
}
