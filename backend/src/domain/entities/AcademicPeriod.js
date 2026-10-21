import { BaseEntity } from './BaseEntity.js';
import { DIVISIONES_PERIODO_ACADEMICO_VALUES } from '../constants/index.js';

/**
 * Entidad de Dominio: AcademicPeriod
 * Representa un periodo académico temporal dentro de una gestión
 * Ejemplo: Planificación, Primer Bimestre, Segundo Bimestre, Clausura
 */
export class AcademicPeriod extends BaseEntity {
  constructor(data = {}) {
    super(data);
    // Solo inicializar campos si fueron proporcionados explícitamente
    // Esto permite usar attributes limitados sin inicializar campos no solicitados
    if (Object.prototype.hasOwnProperty.call(data, 'managementId')) {
      this.managementId = data.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'code')) {
      this.code = data.code; // Ej: "2025-PLAN", "2025-BIM1", "2025-CLAU"
    }
    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      this.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'division')) {
      this.division = data.division; // PLANIFICACION, MENSUAL, BIMESTRE, TRIMESTRE, CUATRIMESTRE, SEMESTRE, CLAUSURA, OTRO
    }
    if (Object.prototype.hasOwnProperty.call(data, 'orderNumber')) {
      this.orderNumber = data.orderNumber;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'startDate')) {
      this.startDate = data.startDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'endDate')) {
      this.endDate = data.endDate;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'colorHex')) {
      this.colorHex = data.colorHex;
    }
  }

  /**
   * Valida el tipo de división
   * @returns {boolean}
   */
  isValidDivision() {
    if (!this.division) return false;
    return DIVISIONES_PERIODO_ACADEMICO_VALUES.includes(this.division);
  }

  /**
   * Valida el formato del color hexadecimal
   * @returns {boolean}
   */
  isValidColorHex() {
    if (!this.colorHex) return true; // Opcional
    return /^#[0-9A-F]{6}$/i.test(this.colorHex);
  }

  /**
   * Verifica si el periodo está vigente según las fechas
   * @returns {boolean}
   */
  isCurrentlyActive() {
    if (!this.startDate || !this.endDate) return false;
    const today = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return today >= start && today <= end;
  }

  /**
   * Convierte la entidad a objeto plano
   * Solo incluye campos que existen en la instancia (fueron inicializados)
   * @returns {Object}
   */
  toPlainObject() {
    const plainObject = super.toPlainObject();

    // Solo incluir campos que fueron inicializados (existen en this)
    if (Object.prototype.hasOwnProperty.call(this, 'managementId')) {
      plainObject.managementId = this.managementId;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'code')) {
      plainObject.code = this.code;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'name')) {
      plainObject.name = this.name;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'division')) {
      plainObject.division = this.division;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'orderNumber')) {
      plainObject.orderNumber = this.orderNumber;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'startDate')) {
      plainObject.startDate = this.startDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'endDate')) {
      plainObject.endDate = this.endDate;
    }
    if (Object.prototype.hasOwnProperty.call(this, 'colorHex')) {
      plainObject.colorHex = this.colorHex;
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
