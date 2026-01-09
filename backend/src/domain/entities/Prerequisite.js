import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Prerequisite
 * Representa un prerrequisito entre asignaturas de un plan de estudios
 */
export class Prerequisite extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studyPlanId = data.studyPlanId || null;
    this.planSubjectId = data.planSubjectId || null;
    this.prerequisitePlanSubjectId = data.prerequisitePlanSubjectId || null;
  }

  /**
   * Valida que una asignatura no sea prerrequisito de sí misma
   * @returns {boolean}
   */
  isValid() {
    if (!this.planSubjectId || !this.prerequisitePlanSubjectId) return false;
    return this.planSubjectId !== this.prerequisitePlanSubjectId;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studyPlanId: this.studyPlanId,
      planSubjectId: this.planSubjectId,
      prerequisitePlanSubjectId: this.prerequisitePlanSubjectId,
    };
  }
}
