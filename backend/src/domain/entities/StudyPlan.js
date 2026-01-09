import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudyPlan
 * Representa un plan de estudios completo por carrera según resolución ministerial
 */
export class StudyPlan extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.careerId = data.careerId || null;
    this.planName = data.planName || null;
    this.ministerialResolution = data.ministerialResolution || null;
    this.documentPath = data.documentPath || null;
    this.durationYears = data.durationYears || null;
    this.totalHours = data.totalHours || null;
    this.hoursPerWeek = data.hoursPerWeek || null;
    this.hoursPerMonth = data.hoursPerMonth || null;
    this.hoursPerYear = data.hoursPerYear || null;
    this.observations = data.observations || null;
    this.isActive = data.isActive !== undefined ? data.isActive : false;
  }

  /**
   * Valida que la duración sea positiva
   * @returns {boolean}
   */
  isValidDuration() {
    return this.durationYears > 0;
  }

  /**
   * Valida que las cargas horarias sean positivas
   * @returns {boolean}
   */
  isValidHours() {
    return (
      this.totalHours > 0 &&
      this.hoursPerWeek > 0 &&
      this.hoursPerMonth > 0 &&
      this.hoursPerYear > 0
    );
  }

  /**
   * Convierte la entidad a objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      careerId: this.careerId,
      planName: this.planName,
      ministerialResolution: this.ministerialResolution,
      documentPath: this.documentPath,
      durationYears: this.durationYears,
      totalHours: this.totalHours,
      hoursPerWeek: this.hoursPerWeek,
      hoursPerMonth: this.hoursPerMonth,
      hoursPerYear: this.hoursPerYear,
      observations: this.observations,
      isActive: this.isActive,
    };
  }
}
