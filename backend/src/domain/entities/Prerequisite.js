import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: Prerequisite
 * Representa un prerrequisito entre asignaturas de un plan de estudios
 */
export class Prerequisite extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.studyPlanId = data.studyPlanId || null;
    this.subjectId = data.subjectId || null; // Asignatura que requiere el prerrequisito
    this.prerequisiteId = data.prerequisiteId || null; // Asignatura que debe aprobarse antes
  }

  /**
   * Valida que una asignatura no sea prerrequisito de sí misma
   * @returns {boolean}
   */
  isValid() {
    if (!this.subjectId || !this.prerequisiteId) return false;
    return this.subjectId !== this.prerequisiteId;
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      studyPlanId: this.studyPlanId,
      subjectId: this.subjectId,
      prerequisiteId: this.prerequisiteId,
    };
  }
}
