import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: StudyPlan
 * Representa un plan de estudios completo por carrera según resolución ministerial
 */
export class StudyPlan extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('careerId')) {
      this.careerId = data.careerId;
    }
    if (data.hasOwnProperty('planName')) {
      this.planName = data.planName;
    }
    if (data.hasOwnProperty('ministerialResolution')) {
      this.ministerialResolution = data.ministerialResolution;
    }
    if (data.hasOwnProperty('documentPath')) {
      this.documentPath = data.documentPath;
    }
    if (data.hasOwnProperty('durationYears')) {
      this.durationYears = data.durationYears;
    }
    if (data.hasOwnProperty('totalHours')) {
      this.totalHours = data.totalHours;
    }
    if (data.hasOwnProperty('hoursPerWeek')) {
      this.hoursPerWeek = data.hoursPerWeek;
    }
    if (data.hasOwnProperty('hoursPerMonth')) {
      this.hoursPerMonth = data.hoursPerMonth;
    }
    if (data.hasOwnProperty('hoursPerYear')) {
      this.hoursPerYear = data.hoursPerYear;
    }
    if (data.hasOwnProperty('observations')) {
      this.observations = data.observations;
    }
    if (data.hasOwnProperty('isActive')) {
      this.isActive = data.isActive;
    }
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('careerId')) {
      plainObject.careerId = this.careerId;
    }
    if (this.hasOwnProperty('planName')) {
      plainObject.planName = this.planName;
    }
    if (this.hasOwnProperty('ministerialResolution')) {
      plainObject.ministerialResolution = this.ministerialResolution;
    }
    if (this.hasOwnProperty('documentPath')) {
      plainObject.documentPath = this.documentPath;
    }
    if (this.hasOwnProperty('durationYears')) {
      plainObject.durationYears = this.durationYears;
    }
    if (this.hasOwnProperty('totalHours')) {
      plainObject.totalHours = this.totalHours;
    }
    if (this.hasOwnProperty('hoursPerWeek')) {
      plainObject.hoursPerWeek = this.hoursPerWeek;
    }
    if (this.hasOwnProperty('hoursPerMonth')) {
      plainObject.hoursPerMonth = this.hoursPerMonth;
    }
    if (this.hasOwnProperty('hoursPerYear')) {
      plainObject.hoursPerYear = this.hoursPerYear;
    }
    if (this.hasOwnProperty('observations')) {
      plainObject.observations = this.observations;
    }
    if (this.hasOwnProperty('isActive')) {
      plainObject.isActive = this.isActive;
    }

    return plainObject;
  }

  /**
   * Convierte la entidad a JSON
   * Usa toPlainObject() para serialización
   * @returns {Object}
   */
  toJSON() {
    return this.toPlainObject();
  }
}
