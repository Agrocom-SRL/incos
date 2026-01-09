import { BaseEntity } from './BaseEntity.js';

/**
 * Entidad de Dominio: CalendarActivity
 * Representa una instancia específica de actividad en el calendario académico
 */
export class CalendarActivity extends BaseEntity {
  constructor(data = {}) {
    super(data);
    this.academicPeriodId = data.academicPeriodId || null;
    this.activityId = data.activityId || null;
    this.code = data.code || null; // Ej: "2025-BIM1-001", "2025-PLAN-005"
    this.customName = data.customName || null;
    this.careerIds = data.careerIds || null; // Array de IDs de carreras (JSON o Array)
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.isAllDay = data.isAllDay !== undefined ? data.isAllDay : true;
    this.schedule = data.schedule || null; // JSON: {"inicio": "08:00", "fin": "12:00"}
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
   * @returns {Object}
   */
  toPlainObject() {
    return {
      ...super.toPlainObject(),
      academicPeriodId: this.academicPeriodId,
      activityId: this.activityId,
      code: this.code,
      customName: this.customName,
      careerIds: this.careerIds,
      startDate: this.startDate,
      endDate: this.endDate,
      isAllDay: this.isAllDay,
      schedule: this.schedule,
    };
  }
}
