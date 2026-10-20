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
    if (Object.prototype.hasOwnProperty.call(data, 'careerId')) {
      this.careerId = data.careerId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'planName')) {
      this.planName = data.planName;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'ministerialResolution')) {
      this.ministerialResolution = data.ministerialResolution;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'documentPath')) {
      this.documentPath = data.documentPath;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'durationYears')) {
      this.durationYears = data.durationYears;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'totalHours')) {
      this.totalHours = data.totalHours;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'hoursPerWeek')) {
      this.hoursPerWeek = data.hoursPerWeek;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'hoursPerMonth')) {
      this.hoursPerMonth = data.hoursPerMonth;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'hoursPerYear')) {
      this.hoursPerYear = data.hoursPerYear;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'observations')) {
      this.observations = data.observations;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'isActive')) {
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
    if (Object.prototype.hasOwnProperty.call(this, 'careerId')) {
      plainObject.careerId = this.careerId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'planName')) {
      plainObject.planName = this.planName;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'ministerialResolution')) {
      plainObject.ministerialResolution = this.ministerialResolution;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'documentPath')) {
      plainObject.documentPath = this.documentPath;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'durationYears')) {
      plainObject.durationYears = this.durationYears;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'totalHours')) {
      plainObject.totalHours = this.totalHours;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'hoursPerWeek')) {
      plainObject.hoursPerWeek = this.hoursPerWeek;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'hoursPerMonth')) {
      plainObject.hoursPerMonth = this.hoursPerMonth;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'hoursPerYear')) {
      plainObject.hoursPerYear = this.hoursPerYear;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'observations')) {
      plainObject.observations = this.observations;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'isActive')) {
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
