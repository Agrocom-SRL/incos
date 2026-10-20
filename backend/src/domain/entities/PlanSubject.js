import { BaseEntity } from './BaseEntity.js';
import { MODALIDADES_ASIGNATURA_VALUES, MODALIDADES_ASIGNATURA } from '../constants/index.js';

/**
 * Entidad de Dominio: PlanSubject
 * Representa la asignación de una materia a un periodo en un plan de estudios
 */
export class PlanSubject extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'studyPlanId')) {
      this.studyPlanId = data.studyPlanId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'periodId')) {
      this.periodId = data.periodId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'subjectId')) {
      this.subjectId = data.subjectId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'weeklyHours')) {
      this.weeklyHours = data.weeklyHours;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'credits')) {
      this.credits = data.credits;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'modality')) {
      this.modality = data.modality;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studyPlanId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.modality = MODALIDADES_ASIGNATURA.REGULAR;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'displayOrder')) {
      this.displayOrder = data.displayOrder;
    } else if (!Object.prototype.hasOwnProperty.call(data, 'studyPlanId')) {
      // Solo usar valor por defecto si no se está usando attributes limitados
      this.displayOrder = 1;
    }
  }

  /**
   * Valida el tipo de modalidad
   * @returns {boolean}
   */
  isValidModality() {
    if (!this.modality) return false;
    return MODALIDADES_ASIGNATURA_VALUES.includes(this.modality);
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
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'studyPlanId')) {
      plainObject.studyPlanId = this.studyPlanId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'periodId')) {
      plainObject.periodId = this.periodId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'subjectId')) {
      plainObject.subjectId = this.subjectId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'weeklyHours')) {
      plainObject.weeklyHours = this.weeklyHours;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'credits')) {
      plainObject.credits = this.credits;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'modality')) {
      plainObject.modality = this.modality;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'displayOrder')) {
      plainObject.displayOrder = this.displayOrder;
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
