import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: CalendarActivity
 * Representa una instancia específica de actividad en el calendario académico
 */
export class CalendarActivity extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (data.hasOwnProperty('academicPeriodId')) {
      this.academicPeriodId = data.academicPeriodId;
    }
    if (data.hasOwnProperty('activityId')) {
      this.activityId = data.activityId;
    }
    if (data.hasOwnProperty('code')) {
      this.code = data.code; // Ej: "2025-BIM1-001", "2025-PLAN-005"
    }
    if (data.hasOwnProperty('customName')) {
      this.customName = data.customName;
    }
    if (data.hasOwnProperty('careerIds')) {
      this.careerIds = data.careerIds; // Array de IDs de carreras (JSON o Array)
    }
    if (data.hasOwnProperty('startDate')) {
      this.startDate = data.startDate;
    }
    if (data.hasOwnProperty('endDate')) {
      this.endDate = data.endDate;
    }
    if (data.hasOwnProperty('suspendsClasses')) {
      this.suspendsClasses = data.suspendsClasses; // TRUE = día sin clase (feriado/receso/vacaciones)
    }
  }

  /**
   * Valida que las fechas sean válidas
   * @returns {boolean}
   */
  isValidDates() {
    if (!this.startDate) return false;
    if (this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return end >= start;
    }
    return true;
  }

  /**
   * Verifica si la actividad está vigente según las fechas
   * @returns {boolean}
   */
  isCurrentlyActive() {
    if (!this.startDate) return false;
    const today = new Date();
    const start = new Date(this.startDate);
    if (today < start) return false;
    if (this.endDate) {
      const end = new Date(this.endDate);
      return today <= end;
    }
    return true;
  }

  /**
   * Obtiene el nombre a mostrar (personalizado o del catálogo)
   * @param {string} activityName - Nombre de la actividad del catálogo
   * @returns {string}
   */
  getDisplayName(activityName = null) {
    return this.customName || activityName || 'Actividad sin nombre';
  }

  /**
   * Verifica si la actividad aplica a una carrera específica
   * @param {number} careerId - ID de la carrera
   * @returns {boolean}
   */
  appliesToCareer(careerId) {
    if (!this.careerIds) return true; // NULL = todas las carreras
    let ids = this.careerIds;
    if (typeof this.careerIds === 'string') {
      try {
        ids = JSON.parse(this.careerIds);
      } catch (e) {
        return false;
      }
    }
    if (Array.isArray(ids)) {
      return ids.includes(careerId);
    }
    return false;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (this.hasOwnProperty('academicPeriodId')) {
      plainObject.academicPeriodId = this.academicPeriodId;
    }
    if (this.hasOwnProperty('activityId')) {
      plainObject.activityId = this.activityId;
    }
    if (this.hasOwnProperty('code')) {
      plainObject.code = this.code;
    }
    if (this.hasOwnProperty('customName')) {
      plainObject.customName = this.customName;
    }
    if (this.hasOwnProperty('careerIds')) {
      plainObject.careerIds = this.careerIds;
    }
    if (this.hasOwnProperty('startDate')) {
      plainObject.startDate = this.startDate;
    }
    if (this.hasOwnProperty('endDate')) {
      plainObject.endDate = this.endDate;
    }
    if (this.hasOwnProperty('suspendsClasses')) {
      plainObject.suspendsClasses = this.suspendsClasses;
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
